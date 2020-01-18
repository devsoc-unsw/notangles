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
  ClassTermFinderReference,
  ClassTermFinderDates,
  WarningTag,
} from './interfaces'

interface ClassTermFinderParams {
  cls: Class
  reference?: ClassTermFinderReference
}

/**
 * @constant { ClassTermFinderReference }: Default reference that the classTermFinder function uses to classify classes into terms
 * @example 
 *      a class might start in november and run for 3 months, into the next year, in this case the function finds that the class runs in the summer term, looking at the object:
 *      {
          term: Term.Summer,
          dates: [{ start: 11, length: 3 }, { start: 12, length: 2 }],
        }
        as the class that starts in month 11 and runs for 3 months is listed as a date for the term Summer
          { start: 11, length: 3 }
 */
const defaultReferenceDates: ClassTermFinderReference = [
  {
    term: Term.Summer,
    dates: [
      { start: 11, length: 3 },
      { start: 12, length: 2 },
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
  startDate: Date
  endDate: Date
  refDate: ClassTermFinderDates
}

/**
 * Classifies a class into a term according to the given reference date. Checks if the class matches the
 * the given reference dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {ClassTermFinderDates} refDate: reference dates to match the start and end dates to
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
const classTermFinderChecker = ({
  startDate,
  endDate,
  refDate,
}: ClassTermFinderCheckerParams): Boolean => {
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

/**
 * Finds the Term for a class. Term is defined in interfaces.ts
 * @param { Class } cls: Class to find the term for
 * @param { ClassTermFinderReference } reference: Refernce dates to find the term.
 * Format of each element: { term: Term, dates: { start: number[], length: number[] } }
 * start is an array of possible start dates and length is the number of months the term might run for
 * @returns { Term }: Term which the class is from
 */
const classTermFinder = ({
  cls,
  reference = defaultReferenceDates,
}: ClassTermFinderParams): Term => {
  // Error check
  if (!cls?.termDates) {
    throw new Error('no start and end dates for class: ' + cls)
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
      if (classTermFinderChecker({ startDate, endDate, refDate })) {
        return termData.term
      }
    }
  }

  throw new Error('Could not find term for class: ' + cls)
}

/**
 * Parses data from the data array into a class object
 * @param { Chunk } data: array of text from elements with a data class
 * from a class chunk
 * @returns {Promise<{ classData: Class, warnings: ClassWarnings[] }}: The data that has been scraped, formatted as a class object
 * @returns {false}: Scraping aborted as data chunk does not contain relevant class data (as it is a course enrolment chunk)
 */
const parseClassChunk = (
  data: Chunk
): { classData: Class; warnings: ClassWarnings[] } | false => {
  let index = 0
  const warnings: ClassWarnings[] = []

  // ClassID is a 4 or 5 digit number
  const classID = parseInt(data[index])
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data[index])) {
    throw new Error('Invalid Class Id: ' + classID)
  }
  index++

  // Section is an 4 character alphanumeric code
  const section = data[index]
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    throw new Error('Invalid Section: ' + section)
  }
  index++

  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data[index])) {
    term = termFinderRegex.exec(data[index])[1]
  }
  index++

  // Check if the class is actually course enrolment
  // which is not needed
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  if (courseEnrolmentChecker.test(data[index])) {
    // Abort
    return false
  }

  const activity = data[index]
  if (!activity) {
    throw new Error('Unknown activity: ' + activity)
  }
  index++

  const status: Status = <Status>data[index]
  if (!Object.values(Status).includes(status)) {
    throw new Error('Invalid Status: ' + status)
  }
  index++

  const enrAndCap = data[index].split('/')
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
      warnings.push(
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
      warnings.push(
        makeClassWarning({
          classID: classID,
          term: term,
          errorKey: 'courseEnrolment',
          errorValue: courseEnrolment,
        })
      )
    }
  }
  index++

  // Start and end dates can be used to classify each term code
  const runDates = data[index].split(' - ')
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
  index++

  // Skip meeting and census dates
  index += 2

  // class mode
  const mode = data[index]
  if (!mode || mode === ' ') {
    throw new Error('Invalid Mode: ' + mode)
  }
  index++

  // Skip consent
  index++

  // Any notes for the class (found later with dates)
  let notes: string
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Check if there are any dates
    const dayCheckRegex = /^[A-Z][a-z]{2}$/
    if (!dayCheckRegex.test(data[index])) {
      // Add data as notes field and end checking
      notes = data[index]
      break
    }

    // Otherwise parse the date data
    // Day
    const day: Day = <Day>data[index]
    if (!(day && Object.values(Day).includes(day))) {
      throw new Error('Invalid day: ' + day)
    }
    index++

    // Start and end times
    const times = data[index].split(' - ')
    if (!times || times.length === 0) {
      throw new Error('Could not find start and end times in: ' + times)
    }
    const time = { start: times[0], end: times[1] }
    // Checking the format of the dates
    const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
    if (
      !(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))
    ) {
      throw new Error('Invalid Time(s): ' + time)
    }
    index++

    // location
    let location: string | false = transformHtmlSpecials(data[index])
    // Check if location exists
    const locationTesterRegex = /[A-Za-z]/
    if (!(location && locationTesterRegex.test(location))) {
      // Warning: Unknown location!!
      warnings.push(
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
    index++

    // weeks
    const weeks = data[index]
    // Weeks is an alphanumeric string consisting of numbers, - and ,
    // (Strict requirement)
    let weeksTesterRegex = /^[0-9, <>-]+$/
    if (!weeksTesterRegex.test(weeks)) {
      weeksTesterRegex = /^[0-9A-Z, <>-]+$/
      if (!weeksTesterRegex.test(weeks)) {
        throw new Error('Invalid Weeks data: ' + weeks)
      } else {
        // Just warn -> Invalid/unknown weeks data.
        warnings.push(
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
    index++

    // Extra newline
    index++

    const timeData: Time = { day: day, time: time, weeks: weeks }
    if (location) {
      timeData.location = location
    }
    dateList.push(timeData)
  }

  const classData: Class = {
    classID: classID,
    section: section,
    term: term,
    activity: activity,
    status: status,
    courseEnrolment: courseEnrolment,
    termDates: termDates,
    mode: mode,
    times: dateList,
  }

  if (notes) {
    classData.notes = notes
  }

  return { classData: classData, warnings: warnings }
}

export { parseClassChunk, classTermFinder }
