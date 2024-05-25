import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

  setUserSettings(userId: string, setting: SettingsDto): void {}

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
    timetableId: string,
    selectedCourses: string[],
    selectedClasses: any[],
    createdEvents: EventDto[],
  ): void {}

  editUserTimetable(userId: string, timetable: TimetableDto): void {}
}
