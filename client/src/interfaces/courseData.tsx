export interface CourseData {
  courseCode: string
  courseName: string
  classes: ClassData[]
}

export interface ClassData {
  activity: string
  periods: Period[]
}

export interface Period {
  time: ClassTime
  location: string
}

export interface ClassTime {
  day: string
  start: string
  end: string
}
