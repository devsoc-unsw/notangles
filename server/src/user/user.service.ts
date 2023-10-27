import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaService();
@Injectable()
export class UserService {
  async getUserInfo(_zid: string): Promise<UserDTO> {
    try {
      const res = await prisma.user.findUniqueOrThrow({
        where: { zid: _zid },
        include: {
          timetable: {
            include: {
              createdEvents: true,
            },
          },
          friends: true,
        },
      });

      const data = {
        ...res,
        createdAt: res.createdAt.toISOString(),
        lastLogin: res.lastLogin.toISOString(),
        loggedIn: true, // Change this later
        friends: res.friends.map((f) => f.zid),
        timetables: res.timetable.map((t) => {
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

  async getUserSettings(_zid: string): Promise<SettingsDto> {
    try {
      const settings = await prisma.settings.findUniqueOrThrow({
        where: { zid: _zid },
      });

      return Promise.resolve(settings);
    } catch (e) {
      throw new Error(e);
    }
  }

  setUserSettings(zid: string, setting: SettingsDto): void {}

  async getUserTimetables(_zid: string): Promise<TimetableDto[]> {
    try {
      const res = await prisma.timetable.findMany({
        where: { zid: _zid },
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

  editUserTimetable(zid: string, timetable: TimetableDto): void {}
}
