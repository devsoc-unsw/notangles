import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { createEvents, DateArray } from 'ics';

import type { ClassPeriod, CourseData, CreatedEvents, EventPeriod, SelectedClasses } from '../interfaces/Periods';

/**
 * @param courses The currently selected courses
 * @param createdEvents The created custom events
 * @param classes The currently selected classes
 * @param firstDayOfTerm The first day of term in yyyy-MM-dd format
 */
export const downloadIcsFile = async (
  courses: CourseData[],
  createdEvents: CreatedEvents,
  classes: SelectedClasses,
  firstDayOfTerm: string,
): Promise<void> => {
  if (classes === null) {
    return;
  }

  const formattedClassEvents = getClassEvents(courses, classes).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, period.time.end, period.time.day, week),
    title: `${period.courseCode} ${period.activity}`,
    location: period.locations[0],
  }));

  const formattedCreatedEvents = getCreatedEvents(createdEvents).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, period.time.end, period.time.day, week),
    title: period.event.name,
    location: period.event.location,
  }));

  const icsFile = createEvents(formattedClassEvents.concat(formattedCreatedEvents));
  saveAs(new Blob([icsFile.value as BlobPart], { type: 'text/ics' }), 'notangles.ics');
};

/**
 * @param firstDayOfTerm The first day of term in yyyy-MM-dd format
 * @param timezone The current timezone represented as a number of hours after UTC
 * @param hour The time of the class/event
 * @param day The day the class/event is on
 * @param week The week the class/event is on
 * @returns An array of numbers representing details about the class/event
 */
const generateDateArray = (firstDayOfTerm: string, hour: number, day: number, week: number): DateArray => {
  const [year, dd, mm] = firstDayOfTerm.split('-');
  firstDayOfTerm = `${year}-${mm}-${dd}`;
  const currDate = dayjs(firstDayOfTerm, 'YYYY-MM-DD', true)
    .add(week - 1, 'week')
    .add(day - 1, 'day')
    .add(hour, 'hour');

  return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
};

/**
 * @returns The number of hours we are currently ahead of UTC by
 */
const getUtcOffset = async () => {
  try {
    const timezoneFetch = await fetch('https://worldtimeapi.org/api/timezone/Australia/Sydney');
    const timezoneData = await timezoneFetch.json();
    return parseInt(timezoneData.utc_offset);
  } catch (e) {
    return 10; // AEST is GMT+10
  }
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
