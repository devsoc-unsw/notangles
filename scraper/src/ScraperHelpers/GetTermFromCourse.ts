import { Term, Course, GetTermFromCourseReference } from '../interfaces'
import { formatDates } from './FormatDates'

/**
 * @constant { GetTermFromCourseReference }: Default reference to follow to find the correct term. Each object contains a term and its census date to classify a course.
 */
const defaultReference: GetTermFromCourseReference = [
  { term: Term.Summer, census: '1/8' },
  { term: Term.T1, census: '3/17' },
  { term: Term.T2, census: '6/30' },
  { term: Term.T3, census: '10/11' },
  { term: Term.S1, census: '3/31' },
  { term: Term.S2, census: '8/18' },
]

interface GetDifferenceBetweenDatesParams {
  censusDate: Date
  refDate: Date
}

/**
 * Finds difference between the census date and given reference date (in days)
 * @param { Date } censusDate: Census date for course
 * @param { Date } refDate: Reference date to be compared with
 * @returns { number }: Absolute value of the difference between two dates
 */
const getDifferenceBetweenDates = ({
  censusDate,
  refDate,
}: GetDifferenceBetweenDatesParams): number => {
  return Math.abs(
    Math.round(
      (censusDate.getMonth() - refDate.getMonth()) * 30 +
        censusDate.getDate() -
        refDate.getDate()
    )
  )
}

interface GetTermFromCourseParams {
  course: Course
  reference?: GetTermFromCourseReference
}

/**
 * Given some reference dates for the term,
 * the function returns one of the 6 terms that
 * the course can be a part of
 * [ Summer, T1, T2, T3, S1, S2 ]
 * @param { Course } course: course the term is required for
 * @param { GetTermFromCourseReference } reference: Dates to compare the course dates against
 * @returns { Term[] }: List of all the terms the course runs in based on the census dates provided
 */
const getTermFromCourse = ({
  course,
  reference = defaultReference,
}: GetTermFromCourseParams): Term[] => {
  if (!course.censusDates || course.censusDates.length <= 0) {
    throw new Error('no census dates for course: ' + course.courseCode)
  }
  const censusDates = formatDates(course.censusDates)
  const currentYear = new Date().getFullYear()

  // Add the current year to the date and convert it to a date
  // object so it can be easily parsed
  const refCensusDates = formatDates(
    reference.map(element => element.census + '/' + currentYear)
  )

  // For each of the census dates...add a term to the list
  const termList: Term[] = []
  for (const censusDate of censusDates) {
    // minimum difference with the reference census date means the course is in that term
    let min = -1
    let index = 0
    let term: Term
    for (const refDate of refCensusDates) {
      const diff = getDifferenceBetweenDates({ censusDate, refDate })
      if (diff < min || min === -1) {
        min = diff
        term = reference[index].term
      }
      index++
    }
    termList.push(term)
  }
  return termList
}

export { getTermFromCourse }
