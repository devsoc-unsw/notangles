import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto } from './dto';
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

  createUserTimetable(
    selectedCourses: string[],
    selectedClasses: any[],
    createdEvents: EventDto[],
  ): void {
    // try {
    //   // Generate random timetable id
    //   const timetableId = uuidv4();
    //   const res = await prisma.timetable.create({
    //     data: {
    //       id: timetableId,
    //       name: 'default', // Probably need this as a parameter
    //       selectedCourses: '',
    //     },
    //   });
    // } catch (e) {
    //   throw new Error(e);
    // }
  }

  editUserTimetable(userId: string, timetable: TimetableDto): void {}
}
