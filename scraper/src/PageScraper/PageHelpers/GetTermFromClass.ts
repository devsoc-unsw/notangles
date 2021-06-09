import {
  Term,
  ExtendedTerm,
  OtherTerms,
  Class,
  GetTermFromClassDates,
  GetTermFromClassReference,
} from '../../interfaces'

import { formatDates } from '../../ScraperHelpers/FormatDates'
import { reverseDayAndMonth } from './ReverseDayAndMonth'

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

export { getTermFromClass }
