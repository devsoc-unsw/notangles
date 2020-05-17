import {
  reverseDayAndMonth,
  formatDates,
  transformHtmlSpecials,
  makeClassWarning,
} from './helper'
import {
  Term,
  Class,
  Status,
  ClassWarnings,
  Chunk,
  Time,
  Day,
  GetTermFromClassReference,
  GetTermFromClassDates,
  WarningTag,
  ExtendedTerm,
  OtherTerms,
  ClassChunk,
} from './interfaces'

/**
 * @constant { GetTermFromClassReference }: Default reference that the classTermFinder function uses to classify classes into terms
 * @example 
 *      a class might start in november and run for 3 months, into the next year, in this case the function finds that the class runs in the summer term, looking at the object:
 *      {
          term: Term.Summer,
          dates: [{ start: 11, length: 3 }, { start: 12, length: 2 }],
        }
        as the class that starts in month 11 and runs for 3 months is listed as a date for the term Summer
          { start: 11, length: 3 }
 */
const defaultReferenceDates: GetTermFromClassReference = [
  {
    term: Term.Summer,
    dates: [
      { start: 11, length: 3 },
      { start: 12, length: 2 },
      { start: 1, length: 1 },
    ],
  },
  {
    term: Term.T1,
    dates: [
      { start: 1, length: 2 },
      { start: 1, length: 3 },
      { start: 1, length: 4 },
      { start: 2, length: 1 },
      { start: 2, length: 3 },
      { start: 3, length: 1 },
    ],
  },
  {
    term: Term.T2,
    dates: [
      { start: 3, length: 2 },
      { start: 4, length: 2 },
      { start: 4, length: 3 },
      { start: 5, length: 1 },
      { start: 5, length: 3 },
      { start: 6, length: 1 },
      { start: 6, length: 2 },
      { start: 6, length: 3 },
      { start: 7, length: 1 },
      { start: 7, length: 2 },
      { start: 8, length: 1 },
    ],
  },
  {
    term: Term.T3,
    dates: [
      { start: 8, length: 2 },
      { start: 8, length: 3 },
      { start: 9, length: 1 },
      { start: 9, length: 2 },
      { start: 9, length: 3 },
      { start: 10, length: 1 },
      { start: 10, length: 2 },
    ],
  },
  {
    term: Term.S1,
    dates: [{ start: 2, length: 4 }],
  },
  { term: Term.S2, dates: [{ start: 7, length: 4 }] },
]

interface CompareClassAndRefDatesParams {
  startDate: Date
  endDate: Date
  refDate: GetTermFromClassDates
}

/**
 * Classifies a class into a term according to the given reference date. Checks if the class matches the
 * the given reference dates
 * @param {Date} start: start date of the class
 * @param {Date} end: end date of the class
 * @param {GetTermFromClassDates} refDate: reference dates to match the start and end dates to
 * @example
 *        Given class is starting in november (month 11) and running for 3 months, and the refDate is: { start: 11, length: 3 }, it compares the class dates to the refDate:
 *
 * classTermFinderChecker({
 *  start: Date(12/11/2019),
 *  end: Date(12/2/2020),
 *  refDate: { start: 11, length: 3 }
 * })
 *
 * expect true
 */
const compareClassAndRefDates = ({
  startDate,
  endDate,
  refDate,
}: CompareClassAndRefDatesParams): Boolean => {
  return (
    // Compare start date
    startDate.getMonth() + 1 === refDate.start &&
    // Compare length in months
    endDate.getMonth() -
      startDate.getMonth() +
      (endDate.getFullYear() - startDate.getFullYear()) * 12 ===
      refDate.length
  )
}

interface GetTermFromClassParams {
  cls: Class
  reference?: GetTermFromClassReference
}

/**
 * Finds the Term for a class. Term is defined in interfaces.ts
 * @param { Class } cls: Class to find the term for
 * @param { GetTermFromClassReference } reference: Reference dates to find the term.
 * Format of each element: { term: Term, dates: { start: number[], length: number[] } }
 * start is an array of possible start dates and length is the number of months the term might run for
 * @returns { Term }: Term which the class is from
 */
const getTermFromClass = ({
  cls,
  reference = defaultReferenceDates,
}: GetTermFromClassParams): ExtendedTerm => {
  // Error check
  if (!cls?.termDates) {
    throw new Error('no start and end dates for class: ' + JSON.stringify(cls))
  }

  const [startDate, endDate] = formatDates(
    [cls.termDates.start, cls.termDates.end].map(date =>
      reverseDayAndMonth({ date: date, delimiter: '/' })
    )
  )

  for (const termData of reference) {
    // A term could have any number of start dates
    for (const refDate of termData.dates) {
      // If start date and length match, then term is found
      if (compareClassAndRefDates({ startDate, endDate, refDate })) {
        return termData.term
      }
    }
  }

  // Could not find a term for the class. Put it in "Other"
  return OtherTerms.Other
}

/**
 * Extracts classID (numeric) from the line.
 * Then checks that it is either a 4 or 5 digit number
 * @param { string } data: Line that contains the classId
 * @returns { number }: ClassID of the class
 */
const getClassId = (data: string): number => {
  const classID = parseInt(data)
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data)) {
    throw new Error('Invalid Class Id: ' + classID)
  }

  return classID
}

/**
 * Extracts and checks data about the section of the class
 * @param { string } data: Line that contains data about the section of the class
 * @returns { string }: Section "number" of the class
 */
const getSection = (data: string): string => {
  const section = data
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    throw new Error('Invalid Section: ' + section)
  }

  return section
}

/**
 * Extracts term field and checks that the format is a capital letter, followed by one or two capital letters or numbers
 * @param { string } data: Line that contains the term field
 * @returns { string }: The term that the class runs in
 */
const getTerm = (data: string): string => {
  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data)) {
    term = termFinderRegex.exec(data)[1]
  }

  return term
}

/**
 * Checks if the class activity is simply course enrolment
 * @param { string } data: Line which contains the activity field
 * @returns { boolean }: True if the class activity is course enrolment, false otherwise
 */
const isCourseEnrolment = (data: string): boolean => {
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  return courseEnrolmentChecker.test(data)
}

/**
 * Extracts the activity field, makes sure that it exists
 * @param { string } data:  Line which contains the activity field
 * @returns { string }: Type of activity the class is
 */
const getActivity = (data: string): string => {
  const activity = data
  if (!activity) {
    throw new Error('Unknown activity: ' + activity)
  }

  return activity
}

/**
 * Extracts the status field, makes sure that it exists and is one of the fields described in the enum Status interfaces.ts
 * @param { string } data: Line which contains the status field
 * @returns { Status }: Status of the class (check the Status enum for more details)
 */
const getStatus = (data: string): Status => {
  const status = <Status>data
  if (!Object.values(Status).includes(status)) {
    throw new Error('Invalid Status: ' + status)
  }

  return status
}

interface GetCourseEnrolmentParams {
  data: string
  classID: number
  term: string
}

interface GetCourseEnrolmentReturn {
  courseEnrolment: {
    enrolments: number
    capacity: number
  }
  enrolmentWarnings: ClassWarnings[]
}

/**
 * Extracts the course enrolment field, and checks that it is valid
 * @param { string } data: Line which contains the course enrolment field
 * @param { number } classID: The class id of the current class being parsed
 * @param { string } term: The term in which the class runs
 * @returns { GetCourseEnrolmentReturn }: Number of students enrolled in the course, total number of students allowed to take the course, and any warnings that were raised during parsing data
 */
const getCourseEnrolment = ({
  data,
  classID,
  term,
}: GetCourseEnrolmentParams): GetCourseEnrolmentReturn => {
  const enrolmentWarnings: ClassWarnings[] = []
  const enrAndCap = data.split('/')
  const courseEnrolment = {
    enrolments: parseInt(enrAndCap[0]),
    capacity: parseInt(enrAndCap[1]),
  }
  // Enrolments and capacity are both numbers and enrolment less than capacity
  // (Strict requirement)
  if (
    !courseEnrolment ||
    !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity > 0)
  ) {
    // Lax requirement
    if (
      !courseEnrolment ||
      !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity >= 0)
    ) {
      throw new Error(
        'Invalid Course Enrolment: ' +
          courseEnrolment.enrolments +
          ' ' +
          courseEnrolment.capacity
      )
    } else if (courseEnrolment.capacity === 0) {
      // Zero capacity!!
      enrolmentWarnings.push(
        makeClassWarning({
          classID,
          term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
          tag: WarningTag.ZeroEnrolmentCapacity,
        })
      )
    } // Other error
    else {
      enrolmentWarnings.push(
        makeClassWarning({
          classID,
          term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
        })
      )
    }
  }

  return { courseEnrolment, enrolmentWarnings }
}

interface GetTermDatesReturn {
  start: string
  end: string
}

/**
 * Gets the dates the class starts and ends. Also checks that the dates are in proper format
 * @param { string } data: Line which contains the dates during which the class runs
 * @returns { GetTermDatesReturn }: Start and end dates for the class
 */
const getTermDates = (data: string): GetTermDatesReturn => {
  const runDates = data.split(' - ')
  if (!runDates || runDates.length === 0) {
    throw new Error('Could not find start and end dates in: ' + runDates)
  }
  const termDates = {
    start: runDates[0],
    end: runDates[1],
  }
  // Checking the format of the dates
  const dateCheckerRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/
  if (
    !(
      dateCheckerRegex.test(termDates.start) &&
      dateCheckerRegex.test(termDates.end)
    )
  ) {
    throw new Error('Invalid Date(s): ' + termDates)
  }

  return termDates
}

/**
 * Extracts the mode of class delivery
 * @param { string } mode: Line which contains the mode field
 * @returns { string }: Mode of delivery for a class
 */
const getMode = (mode: string): string => {
  if (!mode || mode === ' ') {
    throw new Error('Invalid Mode: ' + mode)
  }

  return mode
}

/**
 * Checks if the course needs permission of the school to enrol into the class/course
 * @param { string } data: Line which contains data about the consent field
 * @returns { boolean }: true if the course needs consent, else false
 */
const getNeedsConsent = (data: string): boolean => {
  const consentRegex = /[Nn]ot/
  return !consentRegex.test(data)
}

/**
 * Extracts all days the class runs on.
 * @param { string } data: Line which contains the data about the days on which the current class runs
 * @returns { Day[] }: Array of days which the class runs on
 */
const getDays = (data: string): Day[] => {
  const splitData = data.split(/, /)
  if (!splitData || splitData.length === 0) {
    throw new Error('Invalid days: ' + splitData)
  }

  const possibleDays = <Day[]>splitData
  const days: Day[] = []
  if (!possibleDays) {
    return days
  }

  for (const day of possibleDays) {
    if (day && Object.values(Day).includes(day)) {
      days.push(day)
    }
  }
  return days
}

interface GetTimeReturn {
  start: string
  end: string
}

/**
 * Extracts the start and end times of a class
 * @param { string } data: Line which contains data about the class timings
 * @returns { GetTimeReturn }: Start and end times for one instance of the class
 */
const getTime = (data: string): GetTimeReturn => {
  const times = data.split(' - ')
  if (!times || times.length === 0) {
    throw new Error('Could not find start and end times in: ' + times)
  }
  const time = { start: times[0], end: times[1] }
  // Checking the format of the dates
  const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
  if (!(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))) {
    throw new Error('Invalid Time(s): ' + JSON.stringify(time))
  }

  return time
}

interface GetLocationParams {
  data: string
  classID: number
  term: string
}

interface GetLocationReturn {
  location: string | false
  locationWarnings: ClassWarnings[]
}

/**
 * Extracts the location of a class
 * @param { string } data: Line which contains data about the location of the class
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetLocationReturn }: The location for the given timing of the class and any warnings associated with parsing issues
 */
const getLocation = ({
  data,
  classID,
  term,
}: GetLocationParams): GetLocationReturn => {
  let location: string | false = transformHtmlSpecials(data)
  const locationWarnings: ClassWarnings[] = []
  // Check if location exists
  const locationTesterRegex = /[A-Za-z]/
  if (!(location && locationTesterRegex.test(location))) {
    // Warning: Unknown location!!
    locationWarnings.push(
      makeClassWarning({
        classID: classID,
        term: term,
        errorKey: 'location',
        errorValue: location,
        tag: WarningTag.UnknownLocation,
      })
    )

    // Remove location.
    location = false
  }

  return { location, locationWarnings }
}

interface GetWeeksParams {
  data: string
  classID: number
  term: string
}

interface GetWeeksReturn {
  weeks: string
  weeksWarnings: ClassWarnings[]
}

/**
 * Extracts data about the weeks in which the class runs
 * @param { string } data: Line which contains data about the weeks the class runs in
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetWeeksReturn }: The weeks in the term that the course runs in, and any warnings that occured during parsing the data passed
 */
const getWeeks = ({ data, classID, term }: GetWeeksParams): GetWeeksReturn => {
  const weeks = data
  const weeksWarnings: ClassWarnings[] = []
  // Weeks is an alphanumeric string consisting of numbers, - and ,
  // (Strict requirement)
  let weeksTesterRegex = /^[0-9, <>-]+$/
  if (!weeksTesterRegex.test(weeks)) {
    weeksTesterRegex = /^[0-9A-Z, <>-]+$/
    if (!weeksTesterRegex.test(weeks)) {
      throw new Error('Invalid Weeks data: ' + weeks)
    } else {
      // Just warn -> Invalid/unknown weeks data.
      weeksWarnings.push(
        makeClassWarning({
          classID: classID,
          term: term,
          errorKey: 'weeks',
          errorValue: weeks,
          tag: WarningTag.UnknownDate_Weeks,
        })
      )
    }
  }

  return { weeks, weeksWarnings }
}

/**
 * Extracts the name of the instructor (if listed)
 * @param { string } data: Line to be parsed
 * @returns { string }: Name of the instructor that might be listed
 */
const getInstructor = (data: string): string | false => {
  if (data && data !== '') {
    return data
  }
  return false
}

interface GetTimeDataParams {
  data: string[]
  index: number
  classID: number
  term: string
}

interface GetTimeDataReturn {
  dateList: Time[]
  timeDataWarnings: ClassWarnings[]
}

/**
 * Extracts all the times a class is offered through the term
 * @param { string[] } data: The ClassChunk that contains data about the class
 * @param { number } index: The index marking the start of the time data
 * @param { number } classID: Class id of the class being parsed
 * @param { string } term: The term the current class runs in
 * @returns { GetTimeDataReturn }: Array of times during which the class runs, and any warnings representing data errors that were found
 */
const getTimeData = ({
  data,
  index,
  classID,
  term,
}: GetTimeDataParams): GetTimeDataReturn => {
  const timeDataWarnings: ClassWarnings[] = []

  // Any notes for the class (found later with dates)
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Parse the date data
    // Days: There can be multiple days for a single time/class
    const days = getDays(data[index])
    index++

    // Start and end times
    const time = getTime(data[index])
    index++

    // location
    const { location, locationWarnings } = getLocation({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(locationWarnings)
    index++

    // weeks
    const { weeks, weeksWarnings } = getWeeks({
      data: data[index],
      classID,
      term,
    })
    timeDataWarnings.concat(weeksWarnings)
    index++

    // Instructor (if listed)
    const instructor = getInstructor(data[index])
    index++

    // Make copies for each day the class runs
    for (const day of days) {
      const timeData: Time = { day: day, time: time, weeks: weeks }
      if (location) {
        timeData.location = location
      }
      if (instructor) {
        timeData.instructor = instructor
      }
      dateList.push(timeData)
    }
  }

  return { dateList, timeDataWarnings }
}

/**
 * @interface: Indices of all the data that can be extracted from a class chunk
 */
interface ClassChunkIndices {
  classID: number
  section: number
  term: number
  activity: number
  status: number
  courseEnrolment: number
  termDates: number
  meetingDates?: number
  censusDate?: number
  mode: number
  consent: number
  timesStartIndex: number
}

/**
 * @constant { ClassChunkIndices }: Default indices which represent which index to grab data from
 */
const defaultParseIndices: ClassChunkIndices = {
  classID: 0,
  section: 1,
  term: 2,
  activity: 3,
  status: 4,
  courseEnrolment: 5,
  termDates: 6,
  mode: 9,
  consent: 10,
  timesStartIndex: 11,
}

interface parseClassChunkParams {
  chunk: ClassChunk
  parseIndices?: ClassChunkIndices
}

interface parseClassChunkSuccess {
  classData: Class
  warnings: ClassWarnings[]
}

type parseClassChunkReturn = parseClassChunkSuccess | false

/**
 * Parses data from the data array into a class object
 * @param { ClassChunk } data: array of text from elements with a data class
 * from a class chunk
 * @returns { classData: Class, warnings: ClassWarnings[] }: The data that has been scraped, formatted as a class object
 * @returns { false }: Scraping aborted as data chunk does not contain relevant class data (as it is a course enrolment chunk)
 */
const parseClassChunk = ({
  chunk,
  parseIndices = defaultParseIndices,
}: parseClassChunkParams): parseClassChunkReturn => {
  const data = chunk.data
  const warnings: ClassWarnings[] = []

  const classID = getClassId(data[parseIndices.classID])
  const section = getSection(data[parseIndices.section])
  const term = getTerm(data[parseIndices.term])

  // Check if the class is actually course enrolment
  // which is not needed
  // It is simply a special activity so incrementing the index is not required
  if (isCourseEnrolment(data[parseIndices.activity])) {
    // Abort
    return false
  }

  const activity = getActivity(data[parseIndices.activity])
  const status = getStatus(data[parseIndices.status])
  const { courseEnrolment, enrolmentWarnings } = getCourseEnrolment({
    data: data[parseIndices.courseEnrolment],
    classID,
    term,
  })
  warnings.concat(enrolmentWarnings)

  // Start and end dates can be used to classify each term code
  const termDates = getTermDates(data[parseIndices.termDates])
  const mode = getMode(data[parseIndices.mode])
  const needsConsent = getNeedsConsent(data[parseIndices.consent])
  const { dateList, timeDataWarnings } = getTimeData({
    data,
    index: parseIndices.timesStartIndex,
    classID,
    term,
  })
  warnings.concat(timeDataWarnings)

  const classData: Class = {
    classID,
    section,
    term,
    activity,
    status,
    courseEnrolment,
    termDates,
    needsConsent,
    mode,
    times: dateList,
    notes: chunk.notes,
  }

  return { classData, warnings }
}

export { parseClassChunk, getTermFromClass }
