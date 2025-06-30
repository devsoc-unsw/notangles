import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo, UserSettings, UserTimetable } from './types';

@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserInfo(userId: string): Promise<UserInfo> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      profilePictureUrl: data.profilePictureUrl ?? undefined,
    };
  }

  async setProfilePicture(
    userId: string,
    profilePictureUrl: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePictureUrl,
      },
    });
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        settings: true,
      },
    });

    if (!data.settings) {
      throw new Error('User settings not found');
    }

    return data.settings;
  }

  async setSettings(userId: string, settings: UserSettings): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        settings: {
          update: settings,
        },
      },
    });
  }

  async getTimetable(
    userId: string,
    timetableId: string,
  ): Promise<UserTimetable> {
    const data = await this.prisma.timetable.findUniqueOrThrow({
      where: {
        userId,
        id: timetableId,
      },
    });

    return {
      id: data.id,
      name: data.name,
      year: data.year,
      term: data.term,
      primary: data.primary,
    };
  }

  // get term timetable

  async createTimetable(
    userId: string,
    data: { name: string; year: number; term: string },
  ): Promise<String> {
    // check if user has existing timetables
    const numTimetables = await this.prisma.timetable.count({
      where: {
        userId,
        year: data.year,
        term: data.term,
      },
    });

    // add timetable and return id from prisma
    const timetable = await this.prisma.timetable.create({
      data: {
        userId,
        name: data.name,
        year: data.year,
        term: data.term,
        primary: numTimetables === 0,
      },
      select: {
        id: true,
      },
    });

    return timetable.id;
  }

  async deleteTimetable(
    userId: string,
    timetableId: string,
    year: number,
    term: string,
  ): Promise<void> {
    const numTimetables = await this.prisma.timetable.count({
      where: {
        userId,
        year,
        term,
      },
    });

    if (numTimetables <= 1) {
      throw new ForbiddenException('Cannot delete the last timetable.');
    }

    const timetable = await this.prisma.timetable.findUniqueOrThrow({
      where: { id: timetableId },
    });

    if (timetable.primary) {
      throw new ForbiddenException('Cannot delete the primary timetable.');
    }

    await this.prisma.timetable.delete({
      where: {
        id: timetableId,
      },
    });
  }

  async renameTimetable(
    userId: string,
    timetableId: string,
    newName: string,
  ): Promise<void> {
    await this.prisma.timetable.update({
      where: {
        userId,
        id: timetableId,
      },
      data: {
        name: newName,
      },
    });
  }

  async makePrimary(
    userId: string,
    timetableId: string,
    data: { year: number; term: string },
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.timetable.updateMany({
        where: {
          userId,
          primary: true,
          year: data.year,
          term: data.term,
        },
        data: {
          primary: false,
        },
      }),
      this.prisma.timetable.update({
        where: {
          userId: userId,
          id: timetableId,
        },
        data: {
          primary: true,
        },
      }),
    ]);
  }
}
