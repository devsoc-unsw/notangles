import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { TimetableService } from './timetable.service';
import { addDays, addMinutes, addWeeks, parse } from 'date-fns';
import { DateArray, EventAttributes, createEventsAsync } from 'ics';
import { PrismaService } from 'src/prisma/prisma.service';
import { validate } from 'src/utils/validate';

function parseTime(time: string) {
  return time.split(':').map(Number);
}

function parseWeeks(weeks: string) {
  return weeks.split(',').flatMap((part) => {
    const trimmed = part.trim();
    if (!trimmed) return [];
    // date range
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim()));
      const range = [];
      for (let i = start; i <= end; i++) range.push(i);
      return range;
    }
    return [parseInt(trimmed)];
  });
}

function parseOfferingPeriods(offeringPeriod: string) {
  const [startDate, endDate] = offeringPeriod
    .split(' - ')
    .map((s) => parse(s, 'dd/MM/yyyy', new Date()));
  // set end date to end of the day
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

function getDayOffset(dayStr: string): number {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(dayStr);
}
function toDateArray(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

function getClassDateArray(
  firstDay: Date,
  dayString: string,
  timeString: string,
  weeksString: string,
) {
  const dayOffset = getDayOffset(dayString);
  const [startStr, endStr] = timeString.split(' - ');
  const [startHours, startMins] = parseTime(startStr);
  const [endHours, endMins] = parseTime(endStr);
  const weeks = parseWeeks(weeksString);

  return weeks.map((week) => {
    const baseDate = addDays(addWeeks(firstDay, week - 1), dayOffset);
    const start = new Date(baseDate);
    start.setHours(startHours, startMins, 0, 0);
    const end = new Date(baseDate);
    end.setHours(endHours, endMins, 0, 0);
    return { start: toDateArray(start), end: toDateArray(end) };
  });
}

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
    private timetableService: TimetableService,
  ) {}

  async generateClassEvents(
    userId: string,
    timetableId: string,
  ): Promise<EventAttributes[]> {
    const courses = await this.prisma.course.findMany({
      where: { timetableId },
      select: { selectedClasses: true },
    });
    const classIds = courses.flatMap((c) => c.selectedClasses);
    const classDetails = await Promise.all(
      classIds.map((id) => this.graphqlService.getClassDetails(id)),
    );

    return classDetails.flatMap((detail) => {
      if (!detail) return [];
      const { startDate } = parseOfferingPeriods(detail.offering_period);
      return detail.times.flatMap((time) => {
        const dateArrays = getClassDateArray(
          startDate,
          time.day,
          time.time,
          time.weeks,
        );
        return dateArrays.map((event) => {
          return {
            title: `${detail.course.course_code} ${detail.activity}`,
            start: event.start,
            end: event.end,
            location: time.location,
          };
        });
      });
    });
  }

  async generateCreatedEvents(
    userId: string,
    timetableId: string,
  ): Promise<EventAttributes[]> {
    const { term, year } = await this.timetableService.getTimetable(
      userId,
      timetableId,
    );
    const termPeriods = await this.graphqlService.getTermPeriods(year);
    const termPeriod = termPeriods.find((t) => t.term === term);
    if (!termPeriod) return [];
    const { startDate, endDate } = parseOfferingPeriods(
      termPeriod.offering_period,
    );

    const eventIds = await this.timetableService.getEvents(userId, timetableId);
    const events = await Promise.all(
      eventIds.map((id) => this.timetableService.getEvent(userId, id)),
    );

    return events.flatMap((event) => {
      const weekEvents = [];
      const dayBase = addDays(startDate, event.dayOfWeek);
      let start = addMinutes(dayBase, event.start);
      let end = addMinutes(dayBase, event.end);
      while (end.getTime() < endDate.getTime()) {
        weekEvents.push({
          title: event.title,
          start: toDateArray(start),
          end: toDateArray(end),
          location: event.location || '',
        });
        start = addWeeks(start, 1);
        end = addWeeks(end, 1);
      }
      return weekEvents;
    });
  }

  async generateIcs(userId: string, timetableId: string) {
    const timetableExists = await this.timetableService.isTimetableOwnedByUser(
      userId,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);

    const [classEvents, createdEvents] = await Promise.all([
      this.generateClassEvents(userId, timetableId),
      this.generateCreatedEvents(userId, timetableId),
    ]);
    const { error, value } = await createEventsAsync(
      [...classEvents, ...createdEvents],
      {
        productId: '-//DevSoc//Notangles Timetable//EN',
        calName: 'Notangles UNSW Timetable',
      },
    );
    if (error || !value) {
      throw new HttpException(
        'Failed to generate ICS calendar file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return value;
  }
}
