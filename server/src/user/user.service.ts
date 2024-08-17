import { Injectable } from '@nestjs/common';
import {
  SettingsDto,
  UserDTO,
  EventDto,
  TimetableDto,
  ClassDto,
  InitUserDTO,
  ScrapedClassDto,
  ReconstructedTimetableDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';

const API_URL = 'https://timetable.csesoc.app/api/terms'; // TODO - set dev and prod API urls
@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async convertClasses(
    classes: ClassDto[],
  ): Promise<ScrapedClassDto[]> {
    try {
      // For each class in class DTO, we need to fetch information
      const cache = {};

      for (const clz of classes) {
        const k = `${clz.year}-${clz.term}/courses/${clz.courseCode}`;
        if (!(k in cache)) {
          const data = await fetch(`${API_URL}/${k}`);
          const json = await data.json();
          cache[k] = json.classes;
        }
      }

      return classes.map((clz) => {
        const k = `${clz.year}-${clz.term}/courses/${clz.courseCode}`;

        const data = cache[k].find((c) => String(c.classID) === clz.classNo);
        return data;
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  async getUserInfo(_userID: string): Promise<UserDTO> {
    const { userID, timetables, ...userData } =
      await this.prisma.user.findUniqueOrThrow({
        where: { userID: _userID },
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

    const reconstructedTables = await Promise.all(
      timetables.map(async (t) => {
        const classes = await this.convertClasses(t.selectedClasses);
        return {
          name: t.name,
          id: t.id,
          selectedClasses: classes,
          selectedCourses: t.selectedCourses,
          createdEvents: t.createdEvents,
        };
      }),
    );

    const data = {
      ...userData,
      createdAt: userData.createdAt.toISOString(),
      lastLogin: userData.lastLogin.toISOString(),
      // Annnoying that the DTO and the schema have differently named fields so have to do this
      timetables: reconstructedTables,
    };

    return Promise.resolve(data);
  }

  async setUserProfile(data: InitUserDTO): Promise<any> {
    try {
      return Promise.resolve(
        this.prisma.user.upsert({
          where: {
            userID: data.userID,
          },
          create: data,
          update: data,
        }),
      );
    } catch (e) {}
  }

  async getUserSettings(_userID: string): Promise<SettingsDto> {
    try {
      const { userID, ...settings } =
        await this.prisma.settings.findUniqueOrThrow({
          where: { userID: _userID },
        });

      return Promise.resolve(settings);
    } catch (e) {
      throw new Error(e);
    }
  }

  async setUserSettings(
    _userID: string,
    setting: SettingsDto,
  ): Promise<SettingsDto> {
    try {
      return Promise.resolve(
        this.prisma.settings.upsert({
          where: {
            userID: _userID,
          },
          create: { userID: _userID, ...setting },
          update: setting,
        }),
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getUserTimetables(
    _userID: string,
  ): Promise<ReconstructedTimetableDto[]> {
    try {
      const res = await this.prisma.user.findUniqueOrThrow({
        where: { userID: _userID },
        select: {
          timetables: {
            include: {
              createdEvents: true,
              selectedClasses: true,
            },
          },
        },
      });

      const timetables = await Promise.all(
        res.timetables.map(async (t) => {
          const { selectedClasses, ...otherTimetableProps } = t;
          const classes = await this.convertClasses(selectedClasses);
          return {
            ...otherTimetableProps,
            selectedClasses: classes,
          };
        }),
      );

      return Promise.resolve(timetables);
    } catch (e) {
      throw new Error(e);
    }
  }

  async createUserTimetable(
    _userID: string,
    _selectedCourses: string[],
    _selectedClasses: ClassDto[],
    _createdEvents: EventDto[],
    _timetableName?: string,
  ): Promise<any> {
    try {
      // Generate random timetable id
      const _timetableId = uuidv4();

      await this.prisma.timetable.create({
        data: {
          id: _timetableId,
          name: _timetableName,
          selectedCourses: _selectedCourses,
          selectedClasses: {
            create: _selectedClasses,
          },
          createdEvents: {
            create: _createdEvents,
          },
          user: {
            connect: {
              userID: _userID,
            },
          },
        },
      });

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async editUserTimetable(
    _userID: string,
    _timetable: TimetableDto,
  ): Promise<string> {
    const _timetableId = _timetable.id;
    const eventIds = _timetable.createdEvents.map((event) => event.id);
    const classIds = _timetable.createdEvents.map((c) => c.id);

    const update_timetable = this.prisma.timetable.update({
      where: {
        id: _timetableId,
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

    const update_events = _timetable.createdEvents.map((e) =>
      this.prisma.event.upsert({
        where: { id: e.id },
        update: e,
        create: { ...e, timetableId: _timetableId },
      }),
    );

    const delete_classes = this.prisma.class.deleteMany({
      where: {
        timetableId: _timetableId,
        NOT: {
          id: { in: classIds },
        },
      },
    });

    const update_classes = _timetable.selectedClasses.map((c) =>
      this.prisma.class.upsert({
        where: { id: c.id },
        update: c,
        create: {
          ...c,
          timetableId: _timetableId,
        },
      }),
    );

    await this.prisma.$transaction([
      update_timetable,
      delete_events,
      delete_classes,
      ...update_events,
      ...update_classes,
    ]);

    return Promise.resolve(_timetableId);
  }

  async getTimetablesByIDs(
    timetableIDs: string[],
  ): Promise<ReconstructedTimetableDto[]> {
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
