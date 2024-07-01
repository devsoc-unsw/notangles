import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto, ClassDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Timetable, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserInfo(_userId: string): Promise<UserDTO> {
    try {
      const { userID, timetable, ...userData } =
        await this.prisma.user.findUniqueOrThrow({
          where: { userID: _userId },
          include: {
            timetable: {
              include: {
                createdEvents: true,
                selectedClasses: true,
              },
            },
          },
        });

      const data = {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        // deleteUserAt: userData.deleteUserAt.toISOString(),
        lastLogin: userData.lastLogin.toISOString(),
        loggedIn: true, // Change this later
        friends: [], // Need to add friends relation to the DB
        // Annnoying that the DTO and the schema have differently named fields so have to do this
        timetables: timetable.map((t) => {
          return {
            name: t.name,
            timetableId: t.id,
            selectedClasses: t.selectedClasses,
            selectedCourses: t.selectedCourses,
            events: t.createdEvents,
          };
        }),
      };

      return Promise.resolve(data);
    } catch (e) {
      throw new Error(e); // Not sure why I'm just catching and rethrowing - probably should process the error in some way
    }
  }

  async setUserProfile(
    _userId: string,
    _email: string,
    _firstName?: string,
    _lastName?: string,
  ): Promise<any> {
    try {
      const userInfo = {
        userID: _userId,
        firstname: _firstName,
        lastname: _lastName,
        email: _email,
      };

      return Promise.resolve(
        this.prisma.user.upsert({
          where: {
            userID: _userId,
          },
          create: userInfo,
          update: userInfo,
        }),
      );
    } catch (e) {}
  }

  async getUserSettings(_userId: string): Promise<SettingsDto> {
    try {
      const { userId, ...settings } =
        await this.prisma.settings.findUniqueOrThrow({
          where: { userId: _userId },
        });

      return Promise.resolve(settings);
    } catch (e) {
      throw new Error(e);
    }
  }

  async setUserSettings(
    _userId: string,
    setting: SettingsDto,
  ): Promise<SettingsDto> {
    try {
      return Promise.resolve(
        this.prisma.settings.upsert({
          where: {
            userId: _userId,
          },
          create: { userId: _userId, ...setting },
          update: setting,
        }),
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getUserTimetables(_userId: string): Promise<TimetableDto[]> {
    try {
      const res = await this.prisma.timetable.findMany({
        where: { userId: _userId },
        include: {
          selectedClasses: true,
          createdEvents: true,
        },
      });

      // Destructure timetables object to make it easier to work with
      const timetables = res.map((t) => {
        // Again, we should look into renaming events to createEvents to make this easier
        const { id, createdEvents, ...otherTimetableProps } = t;
        return {
          ...otherTimetableProps,
          timetableId: id,
          events: createdEvents,
        };
      });

      return Promise.resolve(timetables);
    } catch (e) {
      throw new Error(e);
    }
  }

  async createUserTimetable(
    _userId: string,
    _selectedCourses: string[],
    _selectedClasses: ClassDto[],
    _createdEvents: EventDto[],
    _timetableName?: string,
  ): Promise<any> {
    try {
      // Generate random timetable id
      const _timetableId = uuidv4();

      // Create timetable - needs to resolve before adding classes and events
      const create_timetable = this.prisma.timetable.create({
        data: {
          id: _timetableId,
          name: _timetableName,
          selectedCourses: _selectedCourses,
          userId: _userId,
        },
      });

      // Create classes
      const classes = _selectedClasses.map((c) => {
        const classId = uuidv4(); // Where is this being generated? For now generating on backend
        return {
          timetableId: _timetableId,
          id: classId,
          classType: c.classType,
          courseName: c.courseName,
        };
      });

      const create_classes = this.prisma.class.createMany({
        data: classes,
        skipDuplicates: true, // Not sure when there would be duplicates, but whatevs
      });

      // Create events
      const events = _createdEvents.map((ev) => {
        return { ...ev, timetableId: _timetableId };
      });

      const create_events = this.prisma.event.createMany({
        data: events,
        skipDuplicates: true,
      });

      await this.prisma.$transaction([
        create_timetable,
        create_classes,
        create_events,
      ]);
      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async editUserTimetable(
    _userId: string,
    _timetable: TimetableDto,
  ): Promise<string> {
    try {
      // Modify timetable
      const _timetableId = _timetable.timetableId;
      const eventIds = _timetable.events.map((event) => event.id);
      const classIds = _timetable.events.map((c) => c.id);

      const update_timetable = this.prisma.timetable.update({
        where: {
          userId: _userId,
        },
        data: {
          name: _timetable.name,
          selectedCourses: _timetable.selectedCourses,
        },
      });

      const delete_events = this.prisma.event.deleteMany({
        where: {
          timetableId: _timetableId,
          NOT: {
            id: { in: eventIds },
          },
        },
      });

      const delete_classes = this.prisma.class.deleteMany({
        where: {
          timetableId: _timetableId,
          NOT: {
            id: { in: classIds },
          },
        },
      });

      const update_events = _timetable.events.map((e) =>
        this.prisma.class.upsert({
          where: { id: e.id },
          update: e,
          create: e,
        }),
      );

      const update_classes = _timetable.selectedClasses.map((c) =>
        this.prisma.class.upsert({
          where: { id: c.id },
          update: {
            // Can these even change?
            classType: c.classType,
            courseName: c.courseName,
          },
          create: {
            timetableId: c.timetableId,
            id: c.id,
            classType: c.classType,
            courseName: c.courseName,
          },
        }),
      );

      // TODO: YET TO BE TESTED
      await this.prisma.$transaction([
        update_timetable,
        delete_events,
        update_events,
        delete_classes,
        update_classes,
      ]);

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getTimetablesByIDs(timetableIDs: string[]): Promise<Timetable[]> {
    try {
      const timetables = await this.prisma.timetable.findMany({
        where: {
          id: {
            in: timetableIDs,
          },
        },
      });
      return timetables;
    } catch (error) {
      console.error('Error retrieving timetables:', error);
    }
  }

  async getUsersByIDs(userIDs: string[]): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          userID: {
            in: userIDs,
          },
        },
      });
      return users;
    } catch (error) {
      console.error('Error retrieving users:', error);
    }
  }

  async deleteUserTimetable(_timetableId: string): Promise<string> {
    try {
      await this.prisma.timetable.delete({
        where: {
          id: _timetableId,
        },
      });

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(_timetableId);
    }
  }
}
