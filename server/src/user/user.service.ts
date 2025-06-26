import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddCourseDto,
  RemoveCourseDto,
  SetCourseColourDto,
  UserInfo,
  UserSettings,
} from './types';

@Injectable({})
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
  ) {}

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

  async isCourseExistsOnGraphQL(
    courseId: string,
    term: string,
  ): Promise<boolean> {
    const courseExists = await this.graphqlService.courseExists(courseId, term);
    return courseExists ? true : false;
  }

  async isTimetableExists(
    userId: string,
    timetableId: string,
  ): Promise<boolean> {
    const timetable = await this.prisma.timetable.findUnique({
      where: {
        id: timetableId,
        userId: userId,
      },
    });
    return timetable ? true : false;
  }

  async isCourseInTimetable(
    courseId: string,
    timetableId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findFirst({
      where: {
        courseId: courseId,
        timetableId: timetableId,
      },
    });
    return course ? true : false;
  }

  isColourCodeValid(colour: string): boolean {
    const hexCodeRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    const defaultColoursRegex = /^default-[1-8]$/;
    return hexCodeRegex.test(colour) || defaultColoursRegex.test(colour);
  }

  async getCourse(courseId: string, tiemtableId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        courseId: courseId,
        timetableId: tiemtableId,
      },
    });
    return course;
  }

  async addCourse(addCourseDto: AddCourseDto): Promise<void> {
    await this.prisma.course.create({
      data: {
        courseId: addCourseDto.courseId,
        colour: addCourseDto.colour,
        selectedClasses: [],
        timetable: {
          connect: {
            id: addCourseDto.timetableId,
          },
        },
      },
    });
  }

  async removeCourse(removeCourseDto: RemoveCourseDto): Promise<void> {
    const course = await this.getCourse(
      removeCourseDto.courseId,
      removeCourseDto.timetableId,
    );
    if (!course) {
      throw new HttpException(
        'Course not found in the specified timetable',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prisma.course.delete({
      where: {
        id: course.id,
      },
    });
  }

  async setCourseColour(setCourseColourDto: SetCourseColourDto): Promise<void> {
    const course = await this.getCourse(
      setCourseColourDto.courseId,
      setCourseColourDto.timetableId,
    );
    if (!course) {
      throw new HttpException(
        'Course not found in the specified timetable',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        colour: setCourseColourDto.colour,
      },
    });
  }
}
