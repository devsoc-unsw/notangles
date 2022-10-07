import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { getTimeZoneOffset } from '../constants/timetable';
import { DbCourse, DbTimes } from '../interfaces/Database';
import { ClassData, ClassPeriod, CourseData } from '../interfaces/Periods';
import { areDuplicatePeriods } from './areDuplicatePeriods';
import { getAllPeriods } from './getAllPeriods';

/**
 * @param location The location of the class
 * @returns The location without its room code (only the actual name of the room)
 */
const locationShorten = (location: string): string => (location ? location.split(' (')[0] : '');

/**
 * @param weekDay The day of the week to convert
 * @returns The numerical representation of the day (1-indexed)
 */
const weekdayToNumber = (weekDay: string) => {
  const conversionTable: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return conversionTable[weekDay];
};

/**
 * @param time The time of day to convert (in 24-hour format)
 * @returns The time of day represented as a number of hours after midnight
 * e.g. 4:30 pm -> 16.5
 */
const timeToNumber = (time: string) => {
  const [hour, minute] = time.split(':').map((part) => Number(part));
  return hour + minute / 60;
};

/**
 * @param a The start of the week range
 * @param b The end of the week range
 * @returns An array containing all numbers between a and b (both inclusive)
 */
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => i + a);

/**
 *
 * @param weeks The string stating which weeks a class is offered in e.g. 1-5, 7-10
 * @returns A list of numbers representing all the weeks a class is offered e.g. [1, 2, 3, 4, 5, 7, 8, 9, 10]
 */
const enumerateWeeks = (weeks: string): number[] =>
  weeks.split(',').flatMap((rangeString) => {
    const stops = rangeString.split('-').map((string) => Number(string));
    return stops.length === 2 ? range(stops[0], stops[1]) : stops[0];
  });

const convertToLocalDayTime = (day: number, start: number, end: number, isConvertToLocalTimezone: boolean): number[] => {
  const offset = getTimeZoneOffset(isConvertToLocalTimezone);

  let newDay = day;
  let newStart = start - offset;
  let newEnd = end - offset;

  // If the new start time is negative, then the class is in the previous day.
  if (newStart < 0) {
    newDay = newDay === 1 ? 7 : newDay - 1;
    newStart = ((newStart % 24) + 24) % 24;
    newEnd = ((newEnd % 24) + 24) % 24;
  }

  return [newDay, newStart, newEnd];
};

/**
 * An adapter that formats a DBTimes object to a Period object
 *
 * @param dbTimes A DBTimes object
 * @return A Period object which is converted from the DBTimes object
 *
 * @example
 * const periods = dbClass.times.map(dbTimesToPeriod)
 */
const dbTimesToPeriod = (dbTimes: DbTimes, classData: ClassData, isConvertToLocalTimezone: boolean): ClassPeriod => {
  // Get the day, start and end time of the class.
  let day = weekdayToNumber(dbTimes.day);
  let start = timeToNumber(dbTimes.time.start);
  let end = timeToNumber(dbTimes.time.end);

  // Convert to local day time.
  [day, start, end] = convertToLocalDayTime(day, start, end, isConvertToLocalTimezone);

  // Get the subActivity of the class (only matters for tutlabs to separate them).
  let subActivity = classData.activity;
  if (classData.activity === 'Tutorial-Laboratory') {
    if (start < end) {
      if (end - start === 1) {
        subActivity = 'Tutorial';
      } else {
        subActivity = 'Laboratory';
      }
    } else {
      if (24 - start + end === 1) {
        subActivity = 'Tutorial';
      } else {
        subActivity = 'Laboratory';
      }
    }
  }

  const classPeriod: ClassPeriod = {
    type: 'class',
    classId: classData.id,
    courseCode: classData.courseCode,
    activity: classData.activity,
    subActivity: subActivity,
    locations: [locationShorten(dbTimes.location)],
    time: {
      day: day,
      start: start,
      end: end,
      weeks: enumerateWeeks(dbTimes.weeks),
      weeksString: dbTimes.weeks.replace(/,/g, ', '),
    },
  };

  return classPeriod;
};

/**
 * An adapter that formats a DBCourse object to a CourseData object
 *
 * @param dbCourse A DBCourse object
 * @return A CourseData object
 *
 * @example
 * const data = await fetch(`${baseURL}/courses/${courseCode}/`)
 * const json: DBCourse = await data.json()
 * const courseInfo = dbCourseToCourseData(json)
 */
export const dbCourseToCourseData = (dbCourse: DbCourse, isConvertToLocalTimezone: boolean): CourseData => {
  const courseData: CourseData = {
    code: dbCourse.courseCode,
    name: dbCourse.name,
    activities: {},
    inventoryData: {},
    earliestStartTime: 24,
    latestFinishTime: 0,
  };

  dbCourse.classes.forEach((dbClass) => {
    const classData: ClassData = {
      id: uuidv4(),
      courseCode: dbCourse.courseCode,
      courseName: dbCourse.name,
      activity: dbClass.activity,
      status: dbClass.status,
      enrolments: dbClass.courseEnrolment.enrolments,
      capacity: dbClass.courseEnrolment.capacity,
      periods: [],
      section: dbClass.section,
    };

    classData.periods = dbClass.times.map((dbTime) => dbTimesToPeriod(dbTime, classData, isConvertToLocalTimezone));

    classData.periods.forEach((period) => {
      // If a class ends at 0, it means it ends at 24 i.e. midnight.
      if (period.time.end == 0) period.time.end = 24;
    });

    // Split a class up in two if it spans over midnight.
    classData.periods.forEach((period) => {
      if (period.time.start > period.time.end) {
        // Only deep clone the time object since we want the class and locations to be updated.
        const newPeriod: ClassPeriod = {
          type: 'class',
          classId: period.classId,
          courseCode: period.courseCode,
          activity: period.activity,
          subActivity: period.subActivity,
          time: cloneDeep(period.time),
          locations: period.locations,
        };

        // The second period is from midnight to the end time, and is on the next day.
        newPeriod.time.day = newPeriod.time.day === 7 ? 1 : newPeriod.time.day + 1;
        newPeriod.time.start = 0;

        classData.periods.push(newPeriod);

        // Change the original period to end at midnight.
        period.time.end = 24;
      }
    });

    // Update the earliest start time and latest finish time of the course.
    classData.periods.forEach((period) => {
      if (period.time.end > courseData.latestFinishTime) {
        courseData.latestFinishTime = Math.ceil(period.time.end);
      }

      if (period.time.start < courseData.earliestStartTime) {
        courseData.earliestStartTime = Math.floor(period.time.start);
      }
    });

    if (!(dbClass.activity in courseData.activities)) {
      courseData.activities[dbClass.activity] = [];
    }

    courseData.activities[dbClass.activity].push(classData);
  });

  Object.keys(courseData.activities).forEach((activity) => {
    const allPeriods = getAllPeriods(courseData.activities, activity);

    // Combine the locations of all periods which occur simultaneously with each other
    // This is to create the list of all possible locations a period can be in
    // It is used in the expanded class view
    courseData.activities[activity].forEach((classData) => {
      classData.periods = classData.periods.map((currPeriod) => {
        currPeriod.locations = [
          ...currPeriod.locations,
          ...allPeriods
            .filter((period) => currPeriod !== period && areDuplicatePeriods(currPeriod, period))
            .map((periods) => periods.locations[0]),
        ];

        return currPeriod;
      });
    });
  });

  Object.keys(courseData.activities).forEach((activity) => {
    courseData.inventoryData[activity] = {
      type: 'inventory',
      classId: null,
      courseCode: courseData.code,
      activity: activity,
    };
  });

  return courseData;
};
