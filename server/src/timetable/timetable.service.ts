import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { validate } from 'src/utils/validate';
import {
  AddCourseDto,
  CourseDetails,
  UserTimetable,
  EventParameters,
} from './types';
import type { ClassDetails } from 'src/graphql/types';
import { EventType } from '../generated/prisma/enums';

@Injectable()
export class TimetableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
  ) {}

  async isTimetableOwnedByUser(
    userId: string,
    timetableId: string,
  ): Promise<boolean> {
    const timetable = await this.prisma.timetable.findUnique({
      select: { userId: true },
      where: { id: timetableId },
    });
    return timetable?.userId === userId;
  }

  async isCourseInTimetable(
    timetableId: string,
    courseId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findFirst({
      where: { courseId, timetableId },
      select: { id: true },
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
      where: { timetableId },
      select: { courseId: true },
    });
    return courses.map((course) => course.courseId);
  }

  async getCourseIfExists(
    timetableId: string,
    courseId: string,
  ): Promise<CourseDetails> {
    try {
      return await this.prisma.course.findFirstOrThrow({
        select: { id: true, selectedClasses: true },
        where: { courseId, timetableId },
      });
    } catch {
      throw new HttpException(
        'Course is not in timetable',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addCourse(
    userId: string,
    timetableId: string,
    courseId: string,
    colour: string,
  ): Promise<void> {
    const timetable = await this.prisma.timetable.findUniqueOrThrow({
      select: { term: true },
      where: { id: timetableId, userId },
    });

    const courseExistsOnGraphQL = await this.graphqlService.courseExists(
      courseId,
      timetable.term,
    );
    validate(
      courseExistsOnGraphQL,
      'Course does not exist',
      HttpStatus.NOT_FOUND,
    );

    const courseInTimetable = await this.isCourseInTimetable(
      timetableId,
      courseId,
    );
    validate(
      !courseInTimetable,
      'Course is in timetable already',
      HttpStatus.CONFLICT,
    );

    const colourValid = this.isColourCodeValid(colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);

    await this.prisma.course.create({
      data: {
        courseId,
        colour: colour,
        selectedClasses: [],
        timetable: { connect: { id: timetableId } },
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
    await this.prisma.course.delete({ where: { id: course.id } });
  }

  async setCourseColour(
    userId: string,
    timetableId: string,
    courseId: string,
    colour: string,
  ): Promise<void> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const colourValid = this.isColourCodeValid(colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);

    const course = await this.getCourseIfExists(timetableId, courseId);

    await this.prisma.course.update({
      where: { id: course.id },
      data: { colour },
    });
  }

  async getSelectedClassIds(
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
          return { ...details, class_id: classId };
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
      if (error instanceof HttpException) throw error;
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
    validate(
      classDetails!.activity !== undefined &&
        classDetails!.activity !== 'Course Enrollment',
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
      classDetails!,
      course.selectedClasses,
    );
    if (differentTimeSlotClassId) {
      await this.removeClassFromCourse(course, differentTimeSlotClassId);
    }
    await this.addSelectedClass(course, classId);
  }

  private async addSelectedClass(
    course: CourseDetails,
    classId: string,
  ): Promise<void> {
    await this.prisma.course.update({
      where: { id: course.id },
      data: { selectedClasses: { push: classId } },
    });
  }

  private async removeClassFromCourse(
    course: CourseDetails,
    classId: string,
  ): Promise<void> {
    const updatedClasses = course.selectedClasses.filter(
      (existingClassId) => existingClassId !== classId,
    );
    await this.prisma.course.update({
      where: { id: course.id },
      data: { selectedClasses: updatedClasses },
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

  async getTimetable(
    userId: string,
    timetableId: string,
  ): Promise<UserTimetable> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const data = await this.prisma.timetable.findFirstOrThrow({
      where: { id: timetableId },
    });

    return {
      id: data.id,
      name: data.name,
      year: data.year,
      term: data.term,
      primary: data.primary,
    };
  }

  async getUserTimetables(
    userId: string,
    year: number,
    term: string,
  ): Promise<string[]> {
    const timetables = await this.prisma.timetable.findMany({
      where: { userId, year, term },
      select: { id: true },
    });

    return timetables.map((t) => t.id);
  }

  async createTimetable(
    userId: string,
    data: { name: string; year: number; term: string },
  ): Promise<string> {
    const numTimetables = await this.prisma.timetable.count({
      where: { userId, year: data.year, term: data.term },
    });

    const timetable = await this.prisma.timetable.create({
      data: {
        userId,
        name: data.name,
        year: data.year,
        term: data.term,
        primary: numTimetables === 0,
      },
      select: { id: true },
    });

    return timetable.id;
  }

  async deleteTimetable(userId: string, timetableId: string): Promise<void> {
    const timetable = await this.prisma.timetable.findUniqueOrThrow({
      select: { primary: true, year: true, term: true },
      where: { id: timetableId, userId },
    });

    const numTimetables = await this.prisma.timetable.count({
      where: { userId, year: timetable.year, term: timetable.term },
    });

    if (numTimetables <= 1) {
      throw new HttpException(
        'Cannot delete the last timetable.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!timetable) {
      throw new HttpException(
        'Timetable does not belong to this user.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (timetable.primary) {
      throw new HttpException(
        'Cannot delete the primary timetable.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.timetable.delete({ where: { id: timetableId } });
  }

  async renameTimetable(
    userId: string,
    timetableId: string,
    newName: string,
  ): Promise<void> {
    await this.prisma.timetable.updateMany({
      where: { userId, id: timetableId },
      data: { name: newName },
    });
  }

  async makePrimary(userId: string, timetableId: string): Promise<void> {
    const timetable = await this.prisma.timetable.findFirst({
      select: { year: true, term: true },
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new HttpException(
        'Timetable does not belong to this user.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$transaction([
      this.prisma.timetable.updateMany({
        where: {
          userId,
          primary: true,
          year: timetable.year,
          term: timetable.term,
        },
        data: { primary: false },
      }),
      this.prisma.timetable.update({
        where: { id: timetableId },
        data: { primary: true },
      }),
    ]);
  }

  async getEvent(userId: string, eventId: string): Promise<EventParameters> {
    try {
      const event = await this.prisma.event.findUnique({
        select: {
          id: true,
          colour: true,
          dayOfWeek: true,
          start: true,
          end: true,
          type: true,
          title: true,
          description: true,
          location: true,
          timetable: { select: { userId: true } },
        },
        where: { id: eventId },
      });

      if (!event || event.timetable.userId !== userId) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }

      const eventData: EventParameters = {
        id: event.id,
        colour: event.colour,
        dayOfWeek: event.dayOfWeek,
        start: event.start,
        end: event.end,
        type: event.type,
        title: event.title,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
      };

      return eventData;
    } catch {
      throw new HttpException('Event not in timetable', HttpStatus.NOT_FOUND);
    }
  }

  async getAllEvent(
    userId: string,
    timetableId: string,
  ): Promise<EventParameters[]> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const events = (await this.prisma.event.findMany({
      where: { timetableId },
    })) as EventParameters[];

    return events;
  }

  async addEvent(
    userId: string,
    eventId: string,
    eventDetails: EventParameters,
    timetableId: string,
  ): Promise<void> {
    const timetableExists = await this.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const colourValid = this.isColourCodeValid(eventDetails.colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);

    if (!(eventDetails.type in EventType)) {
      throw new HttpException('Invalid event type', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.event.create({
      data: {
        id: eventId,
        title: eventDetails.title,
        description: eventDetails.description ?? undefined,
        location: eventDetails.location ?? undefined,
        colour: eventDetails.colour,
        dayOfWeek: eventDetails.dayOfWeek,
        start: eventDetails.start,
        end: eventDetails.end,
        type: eventDetails.type,
        timetable: { connect: { id: timetableId } },
      },
    });
  }

  async removeEvent(userId: string, eventId: string): Promise<void> {
    if (!(await this.isEventOwnedByUser(userId, eventId))) {
      throw new HttpException('Event could not be found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }

  async updateEvent(
    userId: string,
    eventId: string,
    eventDetails: Partial<EventParameters>,
  ): Promise<void> {
    const event = await this.getEvent(userId, eventId);

    await this.prisma.event.update({
      where: { id: event.id },
      data: {
        ...(eventDetails.title && { title: eventDetails.title }),
        ...(eventDetails.description && {
          description: eventDetails.description,
        }),
        ...(eventDetails.location && { location: eventDetails.location }),
        ...(eventDetails.colour && { colour: eventDetails.colour }),
        ...(eventDetails.dayOfWeek !== undefined && {
          dayOfWeek: eventDetails.dayOfWeek,
        }),
        ...(eventDetails.start !== undefined && { start: eventDetails.start }),
        ...(eventDetails.end !== undefined && { end: eventDetails.end }),
        ...(eventDetails.type && { type: eventDetails.type }),
      },
    });
  }

  async isEventOwnedByUser(userId: string, eventId: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      select: { timetableId: true },
      where: { id: eventId },
    });

    if (!event?.timetableId) {
      return false;
    }

    return this.isTimetableOwnedByUser(userId, event?.timetableId);
  }
}
