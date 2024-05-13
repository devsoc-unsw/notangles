import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto, ClassDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaService();
@Injectable()
export class UserService {
  async getUserInfo(_userId: string): Promise<UserDTO> {
    try {
      const { userId, ...userData } = await prisma.user.findUniqueOrThrow({
        where: { userId: _userId },
        include: {
          timetable: {
            include: {
              createdEvents: true,
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
        timetables: userData.timetable.map((t) => {
          return {
            timetableId: t.id,
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
      const test = {
        userId: _userId,
        firstname: _firstName,
        lastname: _lastName,
        email: _email,
      };

      return Promise.resolve(
        prisma.user.upsert({
          where: {
            userId: _userId,
          },
          create: test,
          update: test,
        }),
      );
    } catch (e) {}
  }

  async getUserSettings(_userId: string): Promise<SettingsDto> {
    try {
      const settings = await prisma.settings.findUniqueOrThrow({
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
        prisma.settings.upsert({
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
      const res = await prisma.timetable.findMany({
        where: { userId: _userId },
        include: {
          selectedClasses: true,
          createdEvents: true,
        },
      });

      // Destructure timetables object to make it easier to work with
      const timetables = res.map((t) => {
        return { ...t, timetableId: t.id, events: t.createdEvents };
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

      // Create timetable
      await prisma.timetable.create({
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

      await prisma.class.createMany({
        data: classes,
        skipDuplicates: true, // Not sure when there would be duplicates, but whatevs
      });

      // Create events
      const events = _createdEvents.map((ev) => {
        return { ...ev, timetableId: _timetableId };
      });

      await prisma.event.createMany({
        data: events,
        skipDuplicates: true,
      });

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  editUserTimetable(userId: string, timetable: TimetableDto): void {}
}
