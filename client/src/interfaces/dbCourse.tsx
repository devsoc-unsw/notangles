import { Period, ClassData, CourseData } from './courseData'

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

const dbClassToClassData = (dbClass: DBClass): ClassData => {
  const periods: Period[] = []
  for (const times of dbClass.times) {
    periods.push(dbTimesToPeriod(times))
  }
  return {
    activity: dbClass.activity,
    periods: periods,
  }
}

export const dbCourseToCourseData = (dbCourse: DBCourse): CourseData => {
  const classes: ClassData[] = []
  for (const c of dbCourse.classes) {
    classes.push(dbClassToClassData(c))
  }
  return {
    courseCode: dbCourse.courseCode,
    courseName: dbCourse.name,
    classes: classes,
  }
}
