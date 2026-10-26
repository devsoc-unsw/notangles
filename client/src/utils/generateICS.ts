import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { saveAs } from 'file-saver';
import { createEvents, DateArray } from 'ics';

import type { ClassPeriod, CourseData, CreatedEvents, EventPeriod, SelectedClasses } from '../interfaces/Periods';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * @param courses The currently selected courses
 * @param createdEvents The created custom events
 * @param classes The currently selected classes
 * @param firstDayOfTerm The first day of term in yyyy-MM-dd format
 */
export const downloadIcsFile = (
  courses: CourseData[],
  createdEvents: CreatedEvents,
  classes: SelectedClasses,
  firstDayOfTerm: string,
): void => {
  if (classes === null) {
    return;
  }

  const formattedClassEvents = getClassEvents(courses, classes).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, period.time.end, period.time.day, week),
    startInputType: 'utc' as const,
    endInputType: 'utc' as const,
    title: `${period.courseCode} ${period.activity}`,
    location: period.locations[0],
  }));

  const formattedCreatedEvents = getCreatedEvents(createdEvents).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, period.time.end, period.time.day, week),
    startInputType: 'utc' as const,
    endInputType: 'utc' as const,
    title: period.event.name,
    location: period.event.location,
  }));

  const icsFile = createEvents(formattedClassEvents.concat(formattedCreatedEvents));
  if (icsFile.error || !icsFile.value) {
    console.error('Failed to generate ICS file', icsFile.error);
    return;
  }
  saveAs(new Blob([icsFile.value], { type: 'text/calendar' }), 'notangles.ics');
};

/**
 * @param firstDayOfTerm The first day of term in yyyy-MM-dd format
 * @param hour The time of the class/event in Sydney time
 * @param day The day the class/event is on
 * @param week The week the class/event is on
 * @returns The UTC date and time of the class/event
 */
const generateDateArray = (firstDayOfTerm: string, hour: number, day: number, week: number): DateArray => {
  // 0 index days and weeks
  const date = dayjs(firstDayOfTerm)
    .add(week - 1, 'w')
    .add(day - 1, 'd')
    .format('YYYY-MM-DD');
  // Resolve the Sydney offset per date so classes either side of daylight saving are correct
  const currDate = dayjs
    .tz(date, 'Australia/Sydney')
    .add(Math.round(hour * 60), 'm')
    .utc();
  return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
};

/**
 * @param courses The currently selected courses
 * @param classes The currently selected classes
 * @returns A list of all the extrapolated classes that occur in that term
 */
const getClassEvents = (courses: CourseData[], classes: SelectedClasses): [ClassPeriod, number][] => {
  // NOTE: this function may be useful in other applications, if so, move it to a more reasonably named file.
  const allClasses = courses.flatMap((course) =>
    Object.keys(course.activities)
      .filter((possibleActivity) => classes[course.code] !== null && classes[course.code][possibleActivity] !== null)
      .map((activities) => classes[course.code][activities]),
  );

  return allClasses.flatMap((classTime) =>
    // this cant actually be null, i just filtered it, ts is dumb
    classTime!.periods.flatMap((period) => period.time.weeks.map((week) => [period, week] as [ClassPeriod, number])),
  );
};

/**
 *
 * @param createdEvents The created custom events
 * @returns A list of all the extrapolated custom events that occur in that term
 */
const getCreatedEvents = (createdEvents: CreatedEvents): [EventPeriod, number][] => {
  // assume that we are ignoring week 6!
  return Object.entries(createdEvents).flatMap(([_, period]) =>
    [1, 2, 3, 4, 5, 7, 8, 9, 10].map((week) => [period, week] as [EventPeriod, number]),
  );
};
