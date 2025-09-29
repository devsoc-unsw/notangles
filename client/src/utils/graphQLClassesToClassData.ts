import { getTimeZoneOffset } from '../constants/timetable';
import { ClassData, Day, GQLClassData } from '../interfaces/Timetable';

export const graphQLClassesToClassData = (
  gqlClasses: GQLClassData[],
  isConvertToLocalTimezone: boolean,
): Record<string, ClassData[]> => {
  const classData: Record<string, ClassData[]> = {};

  gqlClasses.forEach((gqlClass) => {
    const classId = gqlClass.id;
    const courseCode = gqlClass.course.course_code;
    const courseName = gqlClass.course.course_name;
    const section = gqlClass.section;
    const activity = gqlClass.activity;
    const status = gqlClass.status;
    const enrolments = parseInt(gqlClass.enrolments.split('/')[0]);
    const capacity = parseInt(gqlClass.enrolments.split('/')[1]);
    const term = gqlClass.term;
    const year = gqlClass.year;
    const locations: string[] = [];

    const periods = gqlClass.times.map((time) => {
      let day = parseDay(time.day);
      let start = parseTime(time.time.split('-')[0]);
      let end = parseTime(time.time.split('-')[1]);

      // Convert to local timezone if needed
      const converted = convertToLocalTimezone(day, start, end, isConvertToLocalTimezone);
      day = converted.day;
      start = converted.start;
      end = converted.end;

      const weeks = parseWeeks(time.weeks);
      locations.push(time.location);
      const subActivity = findSubActivity(activity, start, end);
      return {
        type: 'class' as const,
        classId: gqlClass.id,
        courseId: gqlClass.course.course_id,
        activity: activity,
        subActivity: subActivity,
        time: {
          day: day,
          start: start,
          end: end,
          weeks: weeks,
          weeksString: time.weeks,
        },
        locations: locations,
      };
    });
    if (!(gqlClass.course.course_id in classData)) {
      classData[gqlClass.course.course_id] = [];
    }
    classData[gqlClass.course.course_id].push({
      id: classId,
      classNo: classId,
      courseCode: courseCode,
      courseName: courseName,
      section: section,
      activity: activity,
      status: status,
      enrolments: enrolments,
      capacity: capacity,
      periods: periods,
      term: term,
      year: year,
    });
  });
  return classData;
};

/**
 * @param weekDay The day of the week to convert
 * @returns The numerical representation of the day (1-indexed)
 */
const parseDay = (weekDay: Day): number => {
  const weekdayToNumber: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return weekdayToNumber[weekDay];
};

/**
 * @param time The time of day to convert (in 24-hour format)
 * @returns The time of day represented as a number of hours after midnight
 * e.g. 4:30 pm -> 16.5
 */
const parseTime = (time: string): number => {
  const [hour, minute] = time.split(':').map((part) => Number(part));
  return hour + minute / 60;
};

/**
 *
 * @param weeks The string stating which weeks a class is offered in e.g. 1-5, 7-10
 * @returns A list of numbers representing all the weeks a class is offered e.g. [1, 2, 3, 4, 5, 7, 8, 9, 10]
 */
const parseWeeks = (weeks: string): number[] => {
  return weeks.split(',').flatMap((rangeString) => {
    const stops = rangeString.split('-').map((string) => Number(string));
    return stops.length === 2 ? range(stops[0], stops[1]) : stops[0];
  });
};

/**
 * @param a The start of the week range
 * @param b The end of the week range
 * @returns An array containing all numbers between a and b (both inclusive)
 */
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => i + a);

/**
 * @param day The day of the week (1-indexed)
 * @param start The start time of day (in hours after midnight)
 * @param end The end time of day (in hours after midnight)
 * @returns The day, start, and end time converted to local timezone
 */
const convertToLocalTimezone = (day: number, start: number, end: number, isConvertToLocalTimezone: boolean) => {
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
  return { day: newDay, start: newStart, end: newEnd };
};

/**
 * @param activity The activity type of the class (e.g. Tutorial-Laboratory)
 * @param day The day of the week (1-indexed)
 * @param start The start time of day (in hours after midnight)
 * @param end The end time of day (in hours after midnight)
 * @returns The sub-activity type of the class (e.g. Tutorial or Laboratory) or null if not "Tutorial-Laboratory"
 */
const findSubActivity = (activity: string, start: number, end: number): string | null => {
  if (activity === 'Tutorial-Laboratory') {
    if (start < end) {
      if (end - start === 1) {
        return 'Tutorial';
      } else {
        return 'Laboratory';
      }
    } else {
      if (24 - start + end === 1) {
        return 'Tutorial';
      } else {
        return 'Laboratory';
      }
    }
  }
  return null;
};
