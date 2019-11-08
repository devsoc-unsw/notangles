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

// All possible careers
enum Career {
  Undergraduate = 'Undergraduate',
  Postgraduate = 'Postgraduate',
  Research = 'Research',
}

// Possible Days
enum Day {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}

// Defines the status of a class
enum Status {
  Full = 'Full',
  Open = 'Open',
  On_Hold = 'On Hold',
}

enum ExtendedTerm {
  Other = 'Other',
}

type valueOf<T extends {}> = T[keyof T]

// To account for classes that do not run in any term or that
// could not be classified (The latter case should be avoided)
interface TimetableData extends Record<Term, Course[]> {
  Other?: Course[]
}
type ClassesByTerm = Record<Term, Class[]>

// Defines the interface for input not conforming to the strict requirements
interface warning extends classWarnings {
  courseCode: string
  courseName: string
}

interface classWarnings {
  classID: number
  term: string
  errKey: string
  errValue: unknown
}

interface PageData {
  course_info: Chunk
  classes?: Chunk[]
}

interface Time {
  day: Day
  time: {
    start: string
    end: string
  }
  location?: string
  weeks: string
}

interface Class {
  classID: number
  section: string
  term: string
  activity: string
  status: Status
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
  classes?: Class[]
  notes?: string[]
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
  ClassesByTerm,
  valueOf,
  ExtendedTerm,
  Status,
  Day,
  Career,
  warning,
  classWarnings,
}
