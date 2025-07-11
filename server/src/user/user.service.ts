import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddCourseDto,
  CourseDetails,
  SetCourseColourDto,
  UserInfo,
  UserSettings,
} from './types';
import type { ClassDetails } from 'src/graphql/types';

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

  async isTimetablePresent(
    userId: string,
    timetableId: string,
  ): Promise<boolean> {
    const timetable = await this.prisma.timetable.findUnique({
      where: {
        id: timetableId,
        userId: userId,
      },
    });
    return timetable !== null;
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
    return course !== null;
  }

  isColourCodeValid(colour: string): boolean {
    const hexCodeRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    const defaultColoursRegex = /^default-[1-8]$/;
    return hexCodeRegex.test(colour) || defaultColoursRegex.test(colour);
  }

  async isClassInTimetable(
    classId: string,
    courseId: string,
    timetableId: string,
  ): Promise<boolean> {
    const courseExists = await this.isCourseInTimetable(courseId, timetableId);
    if (!courseExists) {
      throw new HttpException(
        'Course not found in timetable',
        HttpStatus.NOT_FOUND,
      );
    }
    const course = await this.getCourse(courseId, timetableId);
    return course.selectedClasses.includes(classId);
  }

  async getCourseIds(timetableId: string): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        timetableId: timetableId,
      },
      select: {
        courseId: true,
      },
    });
    return courses.map((course) => course.courseId);
  }

  async getCourse(
    courseId: string,
    timetableId: string,
  ): Promise<CourseDetails> {
    return await this.prisma.course.findFirstOrThrow({
      select: {
        id: true,
        selectedClasses: true,
      },
      where: {
        courseId: courseId,
        timetableId: timetableId,
      },
    });
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

  async removeCourse(courseId: string, timetableId: string): Promise<void> {
    const course = await this.getCourse(courseId, timetableId);
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
    await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        colour: setCourseColourDto.colour,
      },
    });
  }

  async getClasses(courseId: string, timetableId: string): Promise<string[]> {
    return (await this.getCourse(courseId, timetableId)).selectedClasses;
  }

  async differentTimeSlotsExist(
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<string | undefined> {
    try {
      const classData = await this.graphqlService.getClassDetails(classId);
      if (!classData) {
        throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
      }

      const existingClassIds = await this.getClasses(courseId, timetableId);
      if (existingClassIds.length === 0 || existingClassIds === null) {
        return undefined;
      }
      const existingClassDetails = await Promise.all(
        existingClassIds.map(async (classId) => {
          const details = await this.graphqlService.getClassDetails(classId);
          return {
            ...details,
            class_id: classId,
          };
        }),
      );
      if (existingClassDetails === undefined) {
        throw new HttpException(
          'Failed to fetch class details',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const differentTimeSlotsExist = existingClassDetails.filter(
        (classDetails: ClassDetails & { class_id: string }) =>
          classDetails.activity === classData.activity &&
          classDetails.section !== classData.section,
      );
      if (differentTimeSlotsExist.length > 1) {
        throw new HttpException(
          'Multiple different time slots found for the same activity',
          HttpStatus.CONFLICT,
        );
      }
      if (differentTimeSlotsExist.length === 1 && differentTimeSlotsExist[0]) {
        return differentTimeSlotsExist[0].class_id;
      } else {
        return undefined;
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to check for different time slots',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSelectedClass(
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const differentTimeSlotClassId = await this.differentTimeSlotsExist(
      timetableId,
      courseId,
      classId,
    );
    if (differentTimeSlotClassId) {
      await this.removeSelectedClass(
        timetableId,
        courseId,
        differentTimeSlotClassId,
      );
    }
    await this.addSelectedClass(timetableId, courseId, classId);
  }

  async addSelectedClass(
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const course = await this.getCourse(courseId, timetableId);
    await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        selectedClasses: {
          push: classId,
        },
      },
    });
  }

  async removeSelectedClass(
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const course = await this.getCourse(courseId, timetableId);
    const updatedClasses = course.selectedClasses.filter(
      (existingClassId) => existingClassId !== classId,
    );

    await this.prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        selectedClasses: updatedClasses,
      },
    });
  }
}
