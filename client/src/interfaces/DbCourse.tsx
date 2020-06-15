import { Period, ClassData, CourseData } from './CourseData';

// List of the interfaces and types that are used in the scraper

export interface DbCourse {
  courseCode: string
  name: string
  classes: DbClass[]
}

export interface DbClass {
  activity: string
  times: DbTimes[]
  courseEnrolment: DbCourseEnrolment
}

export interface DbCourseEnrolment {
  enrolments: number
  capacity: number
}

export interface DbTimes {
  time: DbTime
  day: string
  location: string
  weeks: string
}

export interface DbTime {
  start: string
  end: string
}

const locationShorten = (location: string): string => location.split(' (')[0];

/**
 * An adapter that formats a DBTimes object to a Period object
 *
 * @param dbTimes A DBTimes object
 * @return A Period object which is converted from the DBTimes object
 *
 * @example
 * const periods = dbClass.times.map(dbTimesToPeriod)
 */
const dbTimesToPeriod = (dbTimes: DbTimes): Period => ({
  location: dbTimes.location,
  locationShort: locationShorten(dbTimes.location),
  time: {
    day: dbTimes.day,
    start: dbTimes.time.start,
    end: dbTimes.time.end,
    weeks: dbTimes.weeks,
  },
});

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
export const dbCourseToCourseData = (dbCourse: DbCourse): CourseData => {
  const activities: Record<string, ClassData[]> = {};
  let latestClassFinishTime = 0;
  dbCourse.classes.forEach((dbClass, index) => {
    const classData: ClassData = {
      classId: `${dbCourse.courseCode}-${dbClass.activity}-${index}`,
      courseCode: dbCourse.courseCode,
      activity: dbClass.activity,
      periods: dbClass.times.map(dbTimesToPeriod),
      enrolments: dbClass.courseEnrolment.enrolments,
      capacity: dbClass.courseEnrolment.capacity,
    };
    classData.periods!.forEach((period) => {
      latestClassFinishTime = latestClassFinishTime > period.time.end
        ? latestClassFinishTime : period.time.end;
    });
    if (!(dbClass.activity in activities)) {
      activities[dbClass.activity] = [];
    }
    activities[dbClass.activity].push(classData);
  });

  Object.keys(activities).forEach((activity) => {
    activities[activity].push({
      classId: `${dbCourse.courseCode}-${activity}`,
      courseCode: dbCourse.courseCode,
      activity: activity,
    })
  })

  return {
    courseCode: dbCourse.courseCode,
    courseName: dbCourse.name,
    classes: activities,
    latestClassFinishTime,
  };
};
