import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddCourseDto,
  ClassData,
  ClassDetails,
  CourseDetails,
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

  async getCourseIDs(timetableId: string): Promise<string[]> {
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

  async isClassExistsOnGraphQL(classId: string): Promise<boolean> {
    const classDetails = await this.graphqlService.getClassDetails(classId);
    return classDetails ? true : false;
  }

  async getCourse(
    courseId: string,
    timetableId: string,
  ): Promise<CourseDetails> {
    const course = await this.prisma.course.findFirst({
      where: {
        courseId: courseId,
        timetableId: timetableId,
      },
    });
    if (course === null) {
      throw new HttpException(
        'Course not found in the specified timetable',
        HttpStatus.NOT_FOUND,
      );
    }

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
    const course = await this.getCourse(courseId, timetableId);
    return course.selectedClasses;
  }

  async getClasseDetails(classId: string): Promise<ClassDetails> {
    const classDetails = await this.graphqlService.getClassDetails(classId);

    if (classDetails === null) {
      throw new HttpException(
        `Class with ID ${classId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return classDetails;
  }

  async differentTimeSlotsExist(
    timetableId: string,
    courseId: string,
    classData: ClassData,
  ): Promise<string | null> {
    try {
      const existingClasses = await this.getClasses(courseId, timetableId);
      if (existingClasses.length === 0 || existingClasses === null) {
        return null;
      }
      const classDetailsPromises = await Promise.all(
        existingClasses.map((classId) => this.getClasseDetails(classId)),
      );
      if (classDetailsPromises === null) {
        throw new HttpException(
          'Failed to fetch class details',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const differentTimeSlotsExist = classDetailsPromises.filter(
        (classDetails: ClassDetails) =>
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
        return differentTimeSlotsExist[0].course_id;
      } else {
        return null;
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
    classData: ClassData,
  ): Promise<void> {
    const differentTimeSlotClassId = await this.differentTimeSlotsExist(
      timetableId,
      courseId,
      classData,
    );
    if (differentTimeSlotClassId) {
      await this.removeSelectedClass(
        timetableId,
        courseId,
        differentTimeSlotClassId,
      );
    }
    await this.addSelectedClass(timetableId, courseId, classData.classId);
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
