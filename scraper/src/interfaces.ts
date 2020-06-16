// List of the interfaces and types that are used in the scraper

/**
 * @interface: Data extracted from a page
 */
interface Chunk {
  data: string[]
}

/**
 * @interface: Data related to a class extracted from a page
 */
interface ClassChunk extends Chunk {
  notes: string[]
}

/**
 * @type: url that represents pages of the site
 */
type TimetableUrl = string

/**
 * @type: List of timetableUrls
 */
type UrlList = TimetableUrl[]

/**
 * @enum: List of possible terms
 */
enum Term {
  Summer = 'Summer',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  S1 = 'S1',
  S2 = 'S2',
}

/**
 * @enum: All possible careers
 */
enum Career {
  Undergraduate = 'Undergraduate',
  Postgraduate = 'Postgraduate',
  PGOnline = 'Postgraduate (Online)',
  Research = 'Research',
}

/**
 * @enum: Possible Days
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
 * @enum: Defines the status of a class
 */
enum Status {
  Full = 'Full',
  Open = 'Open',
  OnHold = 'On Hold',
}

/**
 * @interface ExtendedTerm: Term is not Other under normal circumstances
 */
enum OtherTerms {
  Other = 'Other',
}
type ExtendedTerm = Term | OtherTerms

/**
 * @interface TimetableData: Maps term to list of all courses that run in that term
 */
interface TimetableData extends Record<Term, Course[]> {
  // To account for classes that do not run in any term or that
  // could not be classified (The latter case should be avoided)
  Other?: Course[]
}
type ClassesByTerm = Record<ExtendedTerm, Class[]>

/**
 * @interface CourseWarning: Defines the interface for input not conforming to the strict requirements
 */
interface CourseWarning extends ClassWarnings {
  courseCode: string
  courseName: string
}

/**
 * @enum: Gives information about th error that has ocurred
 */
enum WarningTag {
  Other = 'Other',
  ZeroEnrolmentCapacity = 'Zero Enrolment Capacity',
  UnknownLocation = 'Unknown Location',
  UnknownDate_Weeks = 'Unknown Date - Weeks',
}

/**
 * @interface ClassWarnings: Defines the details about the warning a class might provide
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
 * @interface PageData: Defines the structure of a subsection of a page in Chunks
 */
interface PageData {
  courseInfo: Chunk
  courseClasses?: ClassChunk[]
}

/**
 * @interface Time: Structure of each time object inside a class
 */
interface Time {
  day: Day
  time: {
    start: string
    end: string
  }
  location?: string
  weeks: string
  instructor?: string
}

/**
 * @interface Class: Structure of a scraped class
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
  needsConsent: boolean
  mode: string
  times?: Time[]
  notes?: string[]
}

/**
 * @interface Course: Structure of a scraped course
 */
interface Course extends CourseHead, CourseInfo {
  classes?: Class[]
  notes?: string[]
}

/**
 * @interface CourseHead: Data about the title of the car
 */
interface CourseHead {
  courseCode: string
  name: string
}

/**
 * @interface CourseInfo: Data about the course that is scraped, without the classes
 */
interface CourseInfo {
  school: string
  campus: string
  career: string
  censusDates: string[]
  termsOffered: string[]
}

/**
 * @interface GetTermFromClassDates Structure of a date inside a reference object provided to the getTermFromClass method
 */
interface GetTermFromClassDates {
  start: number
  length: number
}

/**
 * @interface GetTermFromClassReferenceElement: Structure of a reference object provided to the getTermFromClass method
 */
interface GetTermFromClassReferenceElement {
  term: Term
  dates: GetTermFromClassDates[]
}

type GetTermFromClassReference = GetTermFromClassReferenceElement[]

/**
 * @interface GetTermFromCourseElement: Structure of a reference object provided to the getTermFromCourse method
 */
interface GetTermFromCourseRefElement {
  term: Term
  census: string
}

/**
 * @type: The reference list that the term finder function needs
 */
type GetTermFromCourseReference = GetTermFromCourseRefElement[]

export {
  GetTermFromCourseReference,
  GetTermFromClassReference,
  GetTermFromClassDates,
  OtherTerms,
  Time,
  Class,
  Course,
  CourseHead,
  CourseInfo,
  Chunk,
  ClassChunk,
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
  CourseWarning,
  ClassWarnings,
  WarningTag,
}
