import { Period, ClassData, CourseData } from './CourseData'

// List of the interfaces and types that are used in the scraper

export interface DbCourse {
  courseCode: string
  name: string
  classes: DbClass[]
}

export interface DbClass {
  activity: string
  times: DbTimes[]
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

/**
 * An adapter that formats a DBTimes object to a Period object
 * 
 * @param dbTimes A DBTimes object
 * @return A Period object which is converted from the DBTimes object
 * 
 * @example
 * const periods = dbClass.times.map(dbTimesToPeriod)
 */
const dbTimesToPeriod = (dbTimes: DbTimes): Period => {
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
