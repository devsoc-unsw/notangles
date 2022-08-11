import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClassData, ClassPeriod, CourseData } from '../interfaces/Periods';
import { DbTimes, DbCourse } from '../interfaces/Database';
import { getTimeZoneOffset } from '../constants/timetable';

const locationShorten = (location: string): string => location.split(' (')[0];

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

const timeToNumber = (time: string) => {
  const [hour, minute] = time.split(':').map((part) => Number(part));
  return hour + minute / 60;
};

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => i + a);

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
  // E.g. Converting from Sydney to New York time:
  // Tuesday 9 - 12 AEST -> Monday 19 - 22 EDT
  // Tuesday 13 - 16 AEST -> Monday 23 - 26 EDT
  if (newStart < 0) {
    newDay = newDay === 1 ? 7 : newDay - 1;
    newStart = ((newStart % 24) + 24) % 24;
    newEnd = ((newEnd % 24) + 24) % 24;
  }

  return [newDay, newStart, newEnd];
}

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

  const classPeriod: ClassPeriod = {
    type: 'class',
    class: classData,
    locations: [locationShorten(dbTimes.location)],
    time: {
      day: day,
      start: start,
      end: end,
      weeks: enumerateWeeks(dbTimes.weeks),
      weeksString: dbTimes.weeks.replace(/,/g, ', '),
    },
  }

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
      course: courseData,
      activity: dbClass.activity,
      status: dbClass.status,
      enrolments: dbClass.courseEnrolment.enrolments,
      capacity: dbClass.courseEnrolment.capacity,
      periods: [],
      section: dbClass.section,
    };

    classData.periods = dbClass.times.map((dbTime) => dbTimesToPeriod(dbTime, classData, isConvertToLocalTimezone));

    classData.periods.forEach((period) => {

      // If a class ends at 0, it means it ends at 24 or midnight.
      if (period.time.end == 0) period.time.end = 24;

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

  const isDuplicate = (a: ClassPeriod, b: ClassPeriod) =>
    a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;

  Object.keys(courseData.activities).forEach((activity) => {
    let allPeriods: ClassPeriod[] = [];

    courseData.activities[activity].forEach((classData) => {
      allPeriods = [...allPeriods, ...classData.periods];
    });

    courseData.activities[activity].forEach((classData) => {
      classData.periods = classData.periods.map((period) => {
        period.locations = [
          ...period.locations,
          ...allPeriods
            .filter((aPeriod) => period !== aPeriod && isDuplicate(period, aPeriod))
            .map((periods) => periods.locations[0]),
        ];

        return period;
      });
    });
  });

  Object.keys(courseData.activities).forEach((activity) => {
    courseData.inventoryData[activity] = {
      type: 'inventory',
      class: {
        course: courseData,
        activity,
      },
    };
  });

  return courseData;
};

