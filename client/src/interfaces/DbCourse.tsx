import { Period, ClassData, CourseData } from './CourseData'

// List of the interfaces and types that are used in the scraper

export interface DBCourse {
  courseCode: string
  name: string
  classes: DBClass[]
}

export interface DBClass {
  activity: string
  times: DBTimes[]
}

export interface DBTimes {
  time: DBTime
  day: string
  location: string
  weeks: string
}

export interface DBTime {
  start: string
  end: string
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
const dbTimesToPeriod = (dbTimes: DBTimes): Period => {
  return {
    location: dbTimes.location,
    time: {
      day: dbTimes.day,
      start: dbTimes.time.start,
      end: dbTimes.time.end,
    },
  }
}

/**
 * 
 * @param dbCourse 
 */
export const dbCourseToCourseData = (dbCourse: DBCourse): CourseData => {
  const classes: Record<string, ClassData[]> = {}
  dbCourse.classes.forEach((dbClass, index) => {
    const classData: ClassData = {
      classId: `${dbCourse.courseCode}-${dbClass.activity}-${index}`,
      periods: dbClass.times.map(dbTimesToPeriod),
      activity: dbClass.activity,
    }
    if (!(dbClass.activity in classes)) {
      classes[dbClass.activity] = []
    }
    classes[dbClass.activity].push(classData)
  })

  return {
    courseCode: dbCourse.courseCode,
    courseName: dbCourse.name,
    classes,
  }
}
