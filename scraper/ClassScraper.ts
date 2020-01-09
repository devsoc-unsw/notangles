import {
  reverseDayAndMonth,
  formatDates,
  removeHtmlSpecials,
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
  ClassTermFinderReference,
  ClassTermFinderDates,
  WarningTag,
} from './interfaces'

interface ClassTermFinderParams {
  cls: Class
  reference?: ClassTermFinderReference
}

/**
 * @constant { ClassTermFinderReference }: Default reference to follow
 */
const defaultReferenceDates: ClassTermFinderReference = [
  {
    term: Term.Summer,
    dates: [{ start: 11, length: 3 }, { start: 12, length: 2 }],
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

interface ClassTermFinderCheckerParams {
  start: Date
  end: Date
  refDate: ClassTermFinderDates
}

/**
 * Classifies a class according to the given reference date. Checks if the class matches the
 * the given reference dates
 * @param {Date} start: start date of the class
 * @param {Date} end: end date of the class
 * @param {ClassTermFinderDates} refDate: reference dates to match the start and end dates to
 */
const classTermFinderChecker = ({
  start,
  end,
  refDate,
}: ClassTermFinderCheckerParams): Boolean => {
  return (
    start.getMonth() + 1 === refDate.start &&
    end.getMonth() -
      start.getMonth() +
      (end.getFullYear() - start.getFullYear()) * 12 ===
      refDate.length
  )
}

/**
 * Finds the Term for a class. Term is defined in interfaces.ts
 * @param { Class } cls: Class to find the term for
 * @param { ClassTermFinderReference } reference: Refernce dates to find the term.
 * Format of each element: { term: Term, dates: { start: number[], length: number[] } }
 * start is an array of possible start dates and length is the number of months the term might run for
 *
 * @returns { Term }: Term which the class is from
 */
const classTermFinder = ({
  cls,
  reference = defaultReferenceDates,
}: ClassTermFinderParams): Term => {
  // Error check
  if (!(cls && cls.termDates)) {
    throw new Error('no start and end dates for class: ' + cls)
  }

  const [start, end] = formatDates(
    [cls.termDates.start, cls.termDates.end].map(date =>
      reverseDayAndMonth({ date: date, delimiter: '/' })
    )
  )

  for (const termData of reference) {
    // A term could have any number of start dates
    for (const refDate of termData.dates) {
      // If start date and length match, then term is found
      if (classTermFinderChecker({ start, end, refDate })) {
        return termData.term
      }
    }
  }

  throw new Error('Could not find term for class: ' + cls)
}

const getClassId = (data: string): number => {
  const classID = parseInt(data)
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data)) {
    throw new Error('Invalid Class Id: ' + classID)
  }

  return classID
}

const getSection = (data: string): string => {
  const section = data
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    throw new Error('Invalid Section: ' + section)
  }

  return section
}

const getTerm = (data: string): string => {
  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data)) {
    term = termFinderRegex.exec(data)[1]
  }

  return term
}

const isCourseEnrolment = (data: string): boolean => {
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  return courseEnrolmentChecker.test(data)
}

const getActivity = (data: string): string => {
  const activity = data
  if (!activity) {
    throw new Error('Unknown activity: ' + activity)
  }

  return activity
}

const getStatus = (data: string): Status => {
  const status = <Status>data
  if (!Object.values(Status).includes(status)) {
    throw new Error('Invalid Status: ' + status)
  }

  return status
}

interface getCourseEnrolmentParams {
  data: string
  classID: number
  term: string
}

interface getCourseEnrolmentReturn {
  courseEnrolment: {
    enrolments: number
    capacity: number
  }
  enrolmentWarnings: ClassWarnings[]
}

const getCourseEnrolment = ({
  data,
  classID,
  term,
}: getCourseEnrolmentParams): getCourseEnrolmentReturn => {
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
          classID: classID,
          term: term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
          tag: WarningTag.ZeroEnrolmentCapacity,
        })
      )
    } // Other error
    else {
      enrolmentWarnings.push(
        makeClassWarning({
          classID: classID,
          term: term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
        })
      )
    }
  }

  return { courseEnrolment, enrolmentWarnings }
}

interface getTermDatesReturn {
  start: string
  end: string
}

const getTermDates = (data: string): getTermDatesReturn => {
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

const getMode = (mode: string): string => {
  if (!mode || mode === ' ') {
    throw new Error('Invalid Mode: ' + mode)
  }

  return mode
}

const getNeedsConsent = (data: string): boolean => {
  const consentRegex = /[Nn]ot/
  return !consentRegex.test(data)
}

const getDays = (data: string): Day[] => {
  const possibleDays = <Day[]>data.split(', ')
  const days: Day[] = []
  for (const day of possibleDays) {
    if (!(day && Object.values(Day).includes(day))) {
      // throw new Error('Invalid day: ' + day)
      days.push(day)
    }
  }

  return days
}

interface getTimeReturn {
  start: string
  end: string
}

const getTime = (data: string): getTimeReturn => {
  const times = data.split(' - ')
  if (!times || times.length === 0) {
    throw new Error('Could not find start and end times in: ' + times)
  }
  const time = { start: times[0], end: times[1] }
  // Checking the format of the dates
  const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
  if (!(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))) {
    throw new Error('Invalid Time(s): ' + time)
  }

  return time
}

interface getLocationParams {
  data: string
  classID: number
  term: string
}

interface getLocationReturn {
  location: string | false
  locationWarnings: ClassWarnings[]
}

const getLocation = ({
  data,
  classID,
  term,
}: getLocationParams): getLocationReturn => {
  let location: string | false = removeHtmlSpecials(data)
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

interface getWeeksParams {
  data: string
  classID: number
  term: string
}

interface getWeeksReturn {
  weeks: string
  weeksWarnings: ClassWarnings[]
}

const getWeeks = ({ data, classID, term }: getWeeksParams): getWeeksReturn => {
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

interface getTimeDataParams {
  data: string[]
  index: number
  classID: number
  term: string
}

interface getTimeDataReturn {
  dateList: Time[]
  timeDataWarnings: ClassWarnings[]
}

const getTimeData = ({
  data,
  index,
  classID,
  term,
}: getTimeDataParams): getTimeDataReturn => {
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

    // Extra newline
    index++

    const timeData: Time = { days: days, time: time, weeks: weeks }
    if (location) {
      timeData.location = location
    }
    dateList.push(timeData)
  }

  return { dateList, timeDataWarnings }
}

interface getNoteParams {
  data: string[]
  index: number
}

/**
 *
 * @param data:
 */
const getNote = ({ data, index }: getNoteParams): string[] | false => {
  // anything after times is in the notes category
  const noteCount = (data.length - index) % 5
  if (noteCount > 0) {
    return data.slice(data.length - noteCount)
  }
  return false
}

/**
 * Parses data from the data array into a class object
 * @param { Chunk } data: array of text from elements with a data class
 * from a class chunk
 *
 * @returns {Promise<{ classData: Class, warnings: ClassWarnings[] }}: The data that has been scraped, formatted as a class object
 * @returns {false}: Scraping aborted as data chunk does not contain relevant class data (as it is a course enrolment chunk)
 */
const parseClassChunk = (
  data: Chunk
): { classData: Class; warnings: ClassWarnings[] } | false => {
  let index = 0
  const warnings: ClassWarnings[] = []

  // ClassID is a 4 or 5 digit number
  const classID = getClassId(data[index])
  index++

  // Section is an 4 character alphanumeric code
  const section = getSection(data[index])
  index++

  const term = getTerm(data[index])
  index++

  // Check if the class is actually course enrolment
  // which is not needed
  // It is simply a special activity so incrementing the index is not required
  if (isCourseEnrolment(data[index])) {
    // Abort
    return false
  }

  const activity = getActivity(data[index])
  index++

  const status: Status = getStatus(data[index])
  index++

  const { courseEnrolment, enrolmentWarnings } = getCourseEnrolment({
    data: data[index],
    classID,
    term,
  })
  warnings.concat(enrolmentWarnings)
  index++

  // Start and end dates can be used to classify each term code
  const termDates = getTermDates(data[index])
  index++

  // Skip meeting and census dates
  index += 2

  // class mode
  const mode = getMode(data[index])
  index++

  // School consent?
  const consent = getNeedsConsent(data[index])
  index++

  const { dateList, timeDataWarnings } = getTimeData({
    data,
    index,
    classID,
    term,
  })
  warnings.concat(timeDataWarnings)

  const notes = getNote({ data, index })
  if (notes) {
    console.log('\n\nNote Found\n\n')
  }

  const classData: Class = {
    classID: classID,
    section: section,
    term: term,
    activity: activity,
    status: status,
    courseEnrolment: courseEnrolment,
    termDates: termDates,
    needsConsent: consent,
    mode: mode,
    times: dateList,
  }

  if (notes) {
    classData.notes = notes
  }

  return { classData: classData, warnings: warnings }
}

export { parseClassChunk, classTermFinder }
