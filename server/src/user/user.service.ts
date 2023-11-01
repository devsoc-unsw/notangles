import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto, ClassDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

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
      throw new Error(e); // Not sure why I'm just catching and rethrowing - currently placeholder until I decide what to do
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

  async setUserSettings(_zid: string, settings: SettingsDto): Promise<void> {
    try {
      await prisma.settings.upsert({
        where: {
          zid: _zid,
        },
        update: { ...settings },
        create: { ...settings, zid: _zid },
      });

      return Promise.resolve();
    } catch (e) {
      throw new Error(e);
    }
  }

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

  async createUserTimetable(
    _zid: string,
    _name: string,
    _selectedCourses: string[],
    _selectedClasses: ClassDto[],
    _createdEvents: EventDto[],
  ): Promise<void> {
    try {
      // Since we are using UUID to generate IDs, collisions are unlikely and upsert doesn't really make sense - use create instead
      const generatedId = uuidv4();

      // Store timetables
      await prisma.timetable.create({
        data: {
          id: generatedId,
          name: _name,
          selectedCourses: _selectedCourses,
          zid: _zid,
        },
      });

      // Store created events
      await prisma.event.createMany({
        data: _createdEvents.map((e) => {
          return { ...e, timetableId: generatedId };
        }),
      });

      // Store classes
      await prisma.class.createMany({
        data: _selectedClasses.map((c) => {
          return { ...c, timetableId: generatedId };
        }),
      });

      return Promise.resolve();
    } catch (e) {
      throw new Error(e);
    }
  }

  // TBD: Need to think about how to do this one
  async editUserTimetable(
    _zid: string,
    _timetable: TimetableDto,
  ): Promise<void> {}

  async deleteUserTimetable(_timetableId: string): Promise<void> {
    try {
      await prisma.timetable.delete({
        where: {
          id: _timetableId,
        },
      });

      return Promise.resolve();
    } catch (e) {
      throw new Error(e);
    }
  }
}
