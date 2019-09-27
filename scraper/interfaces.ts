// List of the interfaces and types that are used in the scraper

type Chunk = string[]
type TimetableUrl = string
type UrlList = TimetableUrl[]

enum Term {
  Summer = 'Summer',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  S1 = 'S1',
  S2 = 'S2',
}

type TimetableData = Record<Term, Course[]>

interface PageData {
  course_info: Chunk
  classes?: Chunk[]
}

interface Time {
  day: string
  time?: {
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
  times?: Time[]
  notes?: string
}

interface Course extends CourseHead, CourseInfo {
  classes: Class[]
}

interface CourseHead {
  courseCode: string
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
  Term,
}
