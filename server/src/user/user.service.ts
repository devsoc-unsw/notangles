import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo, UserSettings } from './types';

@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

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

  async getEvent(eventId: string, timetableId: string): Promise<EventParameters | null> {
    const course = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        timetableId: timetableId
      }
    });
    if (course === null) {
      throw new HttpException('Event not found in the specified timetable', HttpStatus.NOT_FOUND);
    }
    return course;
  }

  async addEvent(eventParameters: EventParameters): Promise<void> {
    await this.prisma.event.create({
      data: {
        id: eventParameters.id,
        colour: eventParameters.colour,
        dayOfWeek: eventParameters.dayOfWeek,
        start: eventParameters.start,
        end: eventParameters.end,
        type: eventParameters.type,
        timetable: {
          connect: {
            id: eventParameters.timetableId
          }
        }
      }
    })
  }

  async removeEvent(eventId: string, timetableId: string): Promise<void> {
    const event = await this.getEvent(eventId, timetableId);
    if (!event) {
      throw new HttpException('Event not found in the specified timetable', HttpStatus.NOT_FOUND)
    }
    await this.prisma.course.delete({
      where: {
        id: event.id
      }
    })
  }

  async updateEvent(eventId: string, updateEventParameters: EventParameters): Promise<void> {
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        timetableId: updateEventParameters.timetableId
      }
    });

    if (!existingEvent) {
      throw new HttpException('Event not found in the specified timetable', HttpStatus.NOT_FOUND);
    }

    await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        id: updateEventParameters.id,
        colour: updateEventParameters.colour,
        dayOfWeek: updateEventParameters.dayOfWeek,
        start: updateEventParameters.start,
        end: updateEventParameters.end,
        type: updateEventParameters.type,
        timetable: {
          connect: {
            id: updateEventParameters.timetableId
          }
        }
      }
    })
  }
}
