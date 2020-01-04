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

/**
 * All possible careers
 */
enum Career {
  Undergraduate = 'Undergraduate',
  Postgraduate = 'Postgraduate',
  Research = 'Research',
}

/**
 * Possible Days
 */
enum Day {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}

/**
 * Defines the status of a class
 */
enum Status {
  Full = 'Full',
  Open = 'Open',
  OnHold = 'On Hold',
}

/**
 * Term is not Other under normal circumstances
 */
enum ExtendedTerm {
  Other = 'Other',
}

interface TimetableData extends Record<Term, Course[]> {
  // To account for classes that do not run in any term or that
  // could not be classified (The latter case should be avoided)
  Other?: Course[]
}
type ClassesByTerm = Record<Term, Class[]>

/**
 * Defines the interface for input not conforming to the strict requirements
 */
interface Warning extends ClassWarnings {
  courseCode: string
  courseName: string
}

/**
 * Gives information about th error that has ocurred
 */
enum WarningTag {
  Other = 'Other',
  ZeroEnrolmentCapacity = 'Zero Enrolment Capacity',
  UnknownLocation = 'Unknown Location',
  UnknownDate_Weeks = 'Unknown Date - Weeks',
}

/**
 * Defines the details about the warning a class might provide
 */
interface ClassWarnings {
  tag: WarningTag
  classID: number
  term: string
  error: {
    key: string
    value: unknown
  }
}

/**
 * Defines the structure of a subsection of a page in Chunks
 */
interface PageData {
  course_info: Chunk
  classes?: Chunk[]
}

/**
 * Structure of each time object inside a class
 */
interface Time {
  day: Day
  time: {
    start: string
    end: string
  }
  location?: string
  weeks: string
}

/**
 * Structure of a scraped class
 */
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

/**
 * Structure of a scraped course
 */
interface Course extends CourseHead, CourseInfo {
  classes?: Class[]
  notes?: string[]
}

/**
 * Data about the title of the car
 */
interface CourseHead {
  courseCode: string
  name: string
}

/**
 * Data about the course that is scraped, without the classes
 */
interface CourseInfo {
  school: string
  campus: string
  career: string
  censusDates: string[]
  termsOffered: string[]
}

/**
 * Structure of a date inside a reference object provided to the classTermFinder method
 */
interface ClassTermFinderDates {
  start: number
  length: number
}

/**
 * Structure of a reference object provided to the classTermFinder method
 */
interface ClassTermFinderReferenceElement {
  term: Term
  dates: ClassTermFinderDates[]
}

type ClassTermFinderReference = ClassTermFinderReferenceElement[]

/**
 * Structure of a reference object provided to the termFinder method
 */
interface TermFinderReferenceElement {
  term: Term
  census: string
}

type TermFinderReference = TermFinderReferenceElement[]

export {
  TermFinderReference,
  ClassTermFinderReference,
  ClassTermFinderDates,
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
  ExtendedTerm,
  Status,
  Day,
  Career,
  Warning,
  ClassWarnings,
  WarningTag,
}
