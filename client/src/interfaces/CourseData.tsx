// TODO: use these typedefs everywhere
export type CourseCode = string;
export type InInventory = null;
export type Activity = string
export type Activities = Record<Activity, ClassData[]>;

export type SelectedClasses = (
  Record<CourseCode, Record<Activity, ClassData | InInventory>>
);

export interface CourseData {
  code: CourseCode
  name: string
  latestFinishTime: number
  activities: Activities
}

export interface ClassData {
  id: string
  courseCode: CourseCode
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
