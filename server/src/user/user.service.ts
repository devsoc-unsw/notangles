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
import { validate } from 'src/utils/validate';

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

  async isTimetableOwnedByUser(
    userId: string,
    timetableId: string,
  ): Promise<boolean> {
    const timetable = await this.prisma.timetable.findUnique({
      where: {
        id: timetableId,
      },
    });
    return timetable?.userId === userId;
  }

  async isCourseInTimetable(
    timetableId: string,
    courseId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findFirst({
      where: {
        courseId: courseId,
        timetableId: timetableId,
      },
      select: {
        id: true,
      },
    });
    return course !== null;
  }

  isColourCodeValid(colour: string): boolean {
    const hexCodeRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    const defaultColoursRegex = /^default-[1-8]$/;
    return hexCodeRegex.test(colour) || defaultColoursRegex.test(colour);
  }

  async getCourseIds(userId: string, timetableId: string): Promise<string[]> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

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

  async getCourseIfExists(
    timetableId: string,
    courseId: string,
  ): Promise<CourseDetails> {
    try {
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Course is not in timetable',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addCourse(userId: string, addCourseDto: AddCourseDto): Promise<void> {
    const courseExistsOnGraphQL = await this.graphqlService.courseExists(
      addCourseDto.courseId,
      addCourseDto.term,
    );
    validate(
      courseExistsOnGraphQL,
      'Course does not exist',
      HttpStatus.NOT_FOUND,
    );
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      addCourseDto.timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.isCourseInTimetable(
      addCourseDto.timetableId,
      addCourseDto.courseId,
    );
    validate(
      !courseInTimetable,
      'Course is in timetable already',
      HttpStatus.CONFLICT,
    );
    const colourValid = this.isColourCodeValid(addCourseDto.colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);

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

  async removeCourse(
    userId: string,
    timetableId: string,
    courseId: string,
  ): Promise<void> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const course = await this.getCourseIfExists(timetableId, courseId);
    await this.prisma.course.delete({
      where: {
        id: course.id,
      },
    });
  }

  async setCourseColour(
    userId: string,
    setCourseColourDto: SetCourseColourDto,
  ): Promise<void> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      setCourseColourDto.timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const colourValid = this.isColourCodeValid(setCourseColourDto.colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);
    const course = await this.getCourseIfExists(
      setCourseColourDto.timetableId,
      setCourseColourDto.courseId,
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

  async getSelectedClassesId(
    userId: string,
    timetableId: string,
    courseId: string,
  ): Promise<string[]> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const course = await this.getCourseIfExists(timetableId, courseId);
    return course.selectedClasses;
  }

  async differentTimeSlotsExist(
    classData: ClassDetails,
    existingClassIds: string[],
  ): Promise<string | undefined> {
    try {
      const existingClassDetails = await Promise.all(
        existingClassIds.map(async (classId) => {
          const details = await this.graphqlService.getClassDetails(classId);
          return {
            ...details,
            class_id: classId,
          };
        }),
      );
      const differentTimeSlotsExist = existingClassDetails.filter(
        (classDetails: ClassDetails & { class_id: string }) =>
          classDetails.activity === classData.activity &&
          classDetails.section !== classData.section,
      );
      validate(
        differentTimeSlotsExist.length <= 1,
        'Multiple different time slots found for the same activity',
        HttpStatus.CONFLICT,
      );
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
    userId: string,
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const classDetails = await this.graphqlService.getClassDetails(classId);
    validate(
      classDetails !== undefined,
      'Class does not exist',
      HttpStatus.NOT_FOUND,
    );
    // Assertion to help TypeScript understand that classDetails is defined
    if (!classDetails) {
      throw new Error('Class details should be defined');
    }
    validate(
      classDetails?.activity !== undefined &&
        classDetails?.activity !== 'Course Enrollment',
      'Class is not a valid course class',
      HttpStatus.BAD_REQUEST,
    );
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const course = await this.getCourseIfExists(timetableId, courseId);
    validate(
      !course.selectedClasses.includes(classId),
      'Class is already in course',
      HttpStatus.CONFLICT,
    );

    const differentTimeSlotClassId = await this.differentTimeSlotsExist(
      classDetails,
      course.selectedClasses,
    );
    if (differentTimeSlotClassId) {
      await this.removeClassFromCourse(course, differentTimeSlotClassId);
    }
    await this.addSelectedClass(timetableId, courseId, classId);
  }

  async addSelectedClass(
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const course = await this.getCourseIfExists(timetableId, courseId);
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

  async removeClassFromCourse(
    course: CourseDetails,
    classId: string,
  ): Promise<void> {
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

  async removeSelectedClass(
    userId: string,
    timetableId: string,
    courseId: string,
    classId: string,
  ): Promise<void> {
    const classValidate = await this.graphqlService.getClassDetails(classId);
    validate(
      classValidate !== undefined,
      'Class does not exist',
      HttpStatus.NOT_FOUND,
    );
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const course = await this.getCourseIfExists(timetableId, courseId);
    validate(
      course.selectedClasses.includes(classId),
      'Class is not in course',
      HttpStatus.NOT_FOUND,
    );

    await this.removeClassFromCourse(course, classId);
  }
}
