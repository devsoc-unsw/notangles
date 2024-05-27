import { Injectable } from '@nestjs/common';
import {
  SettingsDto,
  UserDTO,
  EventDto,
  TimetableDto,
  ClassDto,
  InitUserDTO,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaService();
@Injectable()
export class UserService {
  async getUserInfo(_userId: string): Promise<UserDTO> {
    const { userId, timetables, ...userData } =
      await prisma.user.findUniqueOrThrow({
        where: { userId: _userId },
        include: {
          timetables: {
            include: {
              createdEvents: true,
              selectedClasses: true,
            },
          },
          friends: true,
          outgoing: true,
          incoming: true,
        },
      });

    const data = {
      ...userData,
      createdAt: userData.createdAt.toISOString(),
      lastLogin: userData.lastLogin.toISOString(),
      // Annnoying that the DTO and the schema have differently named fields so have to do this
      timetables: timetables.map((t) => {
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
  }

  async setUserProfile(data: InitUserDTO): Promise<any> {
    try {
      return Promise.resolve(
        prisma.user.upsert({
          where: {
            userId: data.userId,
          },
          create: data,
          update: data,
        }),
      );
    } catch (e) {}
  }

  async getUserSettings(_userId: string): Promise<SettingsDto> {
    try {
      const { userId, ...settings } = await prisma.settings.findUniqueOrThrow({
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

      const classes = _selectedClasses.map((c) => {
        const classId = uuidv4(); // Where is this being generated? For now generating on backend
        return {
          // timetableId: _timetableId,
          id: classId,
          classType: c.classType,
          courseName: c.courseName,
        };
      });

      await prisma.timetable.create({
        data: {
          id: _timetableId,
          name: _timetableName,
          selectedCourses: _selectedCourses,
          selectedClasses: {
            create: classes,
          },
          createdEvents: {
            create: _createdEvents,
          },
          userId: _userId,
        },
      });

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

      const update_timetable = prisma.timetable.update({
        where: {
          id: _timetableId,
        },
        data: {
          name: _timetable.name,
          selectedCourses: _timetable.selectedCourses,
        },
      });

      const delete_events = prisma.event.deleteMany({
        where: {
          timetableId: _timetableId,
          NOT: {
            id: { in: eventIds },
          },
        },
      });

      const update_events = _timetable.events.map((e) =>
        prisma.event.upsert({
          where: { id: e.id },
          update: e,
          create: { ...e, timetableId: _timetableId },
        }),
      );

      const delete_classes = prisma.class.deleteMany({
        where: {
          timetableId: _timetableId,
          NOT: {
            id: { in: classIds },
          },
        },
      });

      const update_classes = _timetable.selectedClasses.map((c) =>
        prisma.class.upsert({
          where: { id: c.id },
          update: c,
          create: {
            ...c,
            timetableId: _timetableId,
          },
        }),
      );

      await prisma.$transaction([
        update_timetable,
        delete_events,
        delete_classes,
        ...update_events,
        ...update_classes,
      ]);

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async deleteUserTimetable(_timetableId: string): Promise<string> {
    try {
      await prisma.timetable.delete({
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
