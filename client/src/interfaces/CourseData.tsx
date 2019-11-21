export interface CourseData {
  courseCode: string
  courseName: string
  classes: Record<string, ClassData[]>
}

export interface ClassData {
  classId: string
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
