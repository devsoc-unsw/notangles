// mapping from activity name => all classes for that activity
export type Activities = Record<string, ClassData[]>;

// mapping from course code => activity name => selected class
export type SelectedClasses = Record<string, Record<string, ClassData | null>>;

export interface CourseData {
  code: string
  name: string
  latestFinishTime: number
  activities: Activities
}

export interface ClassData {
  id: string
  course: CourseData
  activity: string
  enrolments: number
  capacity: number
  periods: ClassPeriod[]
}

export interface ClassPeriod {
  class: ClassData
  time: ClassTime
  location: string
  locationShort: string
}

export interface ClassTime {
  day: number
  start: number
  end: number
  weeks: number[]
  weeksString: string
}
