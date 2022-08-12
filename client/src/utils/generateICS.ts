import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { createEvents, DateArray } from 'ics';
import type { ClassPeriod, CourseData, CreatedEvents, EventPeriod, SelectedClasses } from '../interfaces/Periods';

/**
 * makes a request to download an ICS file which corresponds to the data the user input
 * @param courses global course data
 * @param classes global classes data
 * @returns
 */
export const downloadIcsFile = async (
  courses: CourseData[],
  createdEvents: CreatedEvents,
  classes: SelectedClasses,
  firstDayOfTerm: string
): Promise<void> => {
  if (classes === null) {
    return;
  }

  const timezone = await getUtcOffset();
  const formattedClassEvents = getClassEvents(courses, classes).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, timezone, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, timezone, period.time.end, period.time.day, week),
    title: `${period.class.courseCode} ${period.class.activity}`,
    location: period.locations[0],
  }));

  const formattedCreatedEvents = getCreatedEvents(createdEvents).map(([period, week]) => ({
    start: generateDateArray(firstDayOfTerm, timezone, period.time.start, period.time.day, week),
    end: generateDateArray(firstDayOfTerm, timezone, period.time.end, period.time.day, week),
    title: period.event.name,
    location: period.event.location,
  }));

  const icsFile = createEvents(formattedClassEvents.concat(formattedCreatedEvents));
  saveAs(new Blob([icsFile.value as BlobPart], { type: 'text/ics' }), 'notangles.ics');
};

const generateDateArray = (firstDayOfTerm: string, timezone: number, hour: number, day: number, week: number): DateArray => {
  // 0 index days and weeks
  const currDate = dayjs(firstDayOfTerm + `T00:00:00.000Z`)
    .subtract(timezone, 'h')
    .add(week - 1, 'w')
    .add(day - 1, 'd')
    .add(hour, 'h');
  return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
};

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
 * @param courses the global course data
 * @param classes the global class data
 * @returns all the extrapolated events that occur in that term
 */
const getClassEvents = (courses: CourseData[], classes: SelectedClasses): [ClassPeriod, number][] => {
  // NOTE: this function may be useful in other applications, if so, move it to a more reasonably named file.
  const allClasses = courses.flatMap((course) =>
    Object.keys(course.activities)
      .filter((possibleActivity) => classes[course.code] !== null && classes[course.code][possibleActivity] !== null)
      .map((activities) => classes[course.code][activities])
  );

  return allClasses.flatMap((classTime) =>
    // this cant actually be null, i just filtered it, ts is dumb
    classTime!.periods.flatMap((period) => period.time.weeks.map((week) => [period, week] as [ClassPeriod, number]))
  );
};

const getCreatedEvents = (createdEvents: CreatedEvents): [EventPeriod, number][] => {
  // assume that we are ignoring week 6!
  return Object.entries(createdEvents).flatMap(([_, period]) =>
    [1, 2, 3, 4, 5, 7, 8, 9, 10].map((week) => [period, week] as [EventPeriod, number])
  );
};
