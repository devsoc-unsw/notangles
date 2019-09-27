// List of the interfaces and types that are used in the scraper

type Chunk = string[]
type TimetableUrl = string
type UrlList = TimetableUrl[]

interface TimetableData {
  Summer: Course[]
  T1: Course[]
  T2: Course[]
  T3: Course[]
  S1: Course[]
  S2: Course[]
}

interface PageData {
  course_info: Chunk
  classes?: Chunk[]
}

interface Time {
  day: string
  time: {
    start: string
    end: string
  }
  location: string
  weeks: string
}

interface Class {
  classID: string
  section: string
  term: string
  activity: string
  status: string
  courseEnrolment: {
    enrolments: number
    capacity: number
  }
  termDates: {
    start: string
    end: string
  }
  mode: string
  times: Time[]
  notes?: string
}

interface Course {
  courseCode: number
  name: string
  school: string
  campus: string
  career: string
  censusDates: string[]
  termsOffered: string[]
  classes: Class[]
}

interface CourseHead {
  courseCode: number
  name: string
}

interface CourseInfo {
  school: string
  campus: string
  career: string
  censusDates: string[]
  termsOffered: string[]
}

export {
  Time,
  Class,
  Course,
  CourseHead,
  CourseInfo,
  Chunk,
  PageData,
  TimetableUrl,
  TimetableData,
  UrlList,
}
