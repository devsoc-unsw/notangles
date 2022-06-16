import { createEvent } from 'ics';

import dayjs from 'dayjs';
import { CourseData, SelectedClasses, ClassPeriod } from '../interfaces/Course';
import { saveAs } from 'file-saver';
import { DateArray } from 'ics';
import { TermDataContext } from '../context/TermDataContext';
import { useContext } from 'react';

/**
 * makes a request to download an ICS file which corresponds to the data the user input
 * @param courses global course data
 * @param classes global classes data
 * @returns
 */
export const downloadIcsFile = async (courses: CourseData[], classes: SelectedClasses): Promise<void> => {
  if (classes === null) {
    return;
  }

  const timezone = await getUtcOffset();
  const icsFile = getAllEvents(courses, classes)
    .map(([period, week]) =>
      createEvent({
        start: generateDateArray(timezone, period.time.start, period.time.day, week),
        end: generateDateArray(timezone, period.time.end, period.time.day, week),
        title: `${period.class.course.code} ${period.class.activity}`,
        location: period.locations[0],
      })
    )
    .map((obj) => obj.value);
  saveAs(new Blob([icsFile.join('\n')], { type: 'text/ics' }), 'notangles.ics');
};

const generateDateArray = (timezone: number, hour: number, day: number, week: number): DateArray => {
  // 0 index days and weeks
  const currDate = dayjs(useContext(TermDataContext)!.firstDayOfTerm + `T00:00:00.000Z`)
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
const getAllEvents = (courses: CourseData[], classes: SelectedClasses): [ClassPeriod, number][] => {
  // NOTE: this function may be useful in other applications, if so, move it to a more reasonably named file.
  let allClasses = courses.flatMap((course) =>
    Object.keys(course.activities)
      .filter((possibleActivity) => classes[course.code] !== null && classes[course.code][possibleActivity] !== null)
      .map((activities) => classes[course.code][activities])
  );

  return allClasses.flatMap((classTime) =>
    // this cant actually be null, i just filtered it, ts is dumb
    classTime!.periods.flatMap((period) => period.time.weeks.map((week) => [period, week] as [ClassPeriod, number]))
  );
};
