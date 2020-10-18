export type Activities = Record<string, ClassData[]>;

export interface CourseData {
  code: string
  name: string
  latestFinishTime: number
  earliestStartTime: number
  activities: Activities
}

export interface ClassData {
  id: string
  classId: number
  course: CourseData
  activity: string
  enrolments: number
  capacity: number
  periods: ClassPeriod[]
}

export interface ClassPeriod {
  time: ClassTime
  location: string
  locationShort: string
}

export interface ClassTime {
  day: number
  start: number
  end: number
  weeks: string
}

export const filterOutClasses = (classes: ClassData[], a: ClassData) => (
  classes.filter((b) => (
    !(a.course.code === b.course.code && a.activity === b.activity)
  ))
);
