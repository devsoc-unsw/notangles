import { Injectable } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CourseParameters,
  ExecutionResult,
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

  isValidCourseParameters(courseParameters: CourseParameters): void {
    if (
      !courseParameters ||
      !courseParameters.courseId ||
      !courseParameters.timetableId ||
      !courseParameters.colour ||
      !courseParameters.term
    ) {
      throw new Error('Invalid course parameters');
    }
  }

  async courseExistsOnGraphQL(
    courseId: string,
    term: string,
  ): Promise<boolean> {
    const courseExists = await this.graphqlService.courseExists(courseId, term);
    if (!courseExists) {
      throw new Error('Course does not exist');
    }
    return true;
  }

  async timetableExists(userId: string, timetableId: string): Promise<void> {
    const timetable = await this.prisma.timetable.findUnique({
      where: {
        id: timetableId,
        userId: userId,
      },
    });
    if (!timetable) {
      throw new Error('Timetable does not exist');
    }
  }

  async isCourseInTimetable(
    courseId: string,
    timetableId: string,
  ): Promise<string> {
    const course = await this.prisma.course.findFirst({
      where: {
        courseId: courseId,
        timetableId: timetableId,
      },
    });
    if (!course) {
      throw new Error('Course does not exist in the timetable');
    }
    return course.id;
  }

  async addCourse(
    userId: string,
    courseParamenters: CourseParameters,
  ): Promise<ExecutionResult> {
    try {
      await this.courseExistsOnGraphQL(
        courseParamenters.courseId,
        courseParamenters.term,
      );
      this.isValidCourseParameters(courseParamenters);
      await this.timetableExists(userId, courseParamenters.timetableId);
      await this.isCourseInTimetable(
        courseParamenters.courseId,
        courseParamenters.timetableId,
      );
      const newCourse = await this.prisma.course.create({
        data: {
          courseId: courseParamenters.courseId,
          timetableId: courseParamenters.timetableId,
          colour: courseParamenters.colour,
          selectedClasses: [], // default to no selected classes
        },
      });
      // If the course does not exist, create a new course entry
      if (!newCourse) {
        throw new Error('Failed to create course');
      }
      // link the course to the timetable
      await this.prisma.timetable.update({
        where: {
          id: courseParamenters.timetableId,
        },
        data: {
          courses: {
            connect: { id: newCourse.id },
          },
        },
      });
      return {
        success: true,
        message: 'Course added successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  async removeCourse(
    userId: string,
    timetableId: string,
    courseID: string,
  ): Promise<ExecutionResult> {
    try {
      await this.timetableExists(userId, timetableId);
      const course = await this.isCourseInTimetable(courseID, timetableId);
      const result = await this.prisma.course.delete({
        where: { id: course },
      });
      if (!result) {
        throw new Error('Failed to remove course');
      }

      // Remove the course from the timetable
      await this.prisma.timetable.update({
        where: {
          id: timetableId,
        },
        data: {
          courses: {
            disconnect: { id: course },
          },
        },
      });
      return {
        success: true,
        message: 'Course removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }
}
