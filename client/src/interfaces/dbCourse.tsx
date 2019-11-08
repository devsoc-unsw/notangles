// List of the interfaces and types that are used in the scraper

export interface DBCourse {
  courseCode: string
  name: string
  classes: DBClass[]
}

export interface DBClass {
  activity: string
  times: DBTimes
}

export interface DBTimes {
  times: DBTime[]
  day: string
  location: string
}

export interface DBTime {
  start: string
  end: string
}
