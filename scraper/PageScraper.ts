import * as puppeteer from 'puppeteer'
import {
  TimetableUrl,
  Chunk,
  PageData,
  Term,
  Course,
  Warning,
  ClassWarnings,
  ClassesByTerm,
  TimetableData,
  CourseInfo,
  TermFinderReference,
} from './interfaces'
import { formatDates, keysOf } from './helper'
import { parseCourseInfoChunk, getCourseHeadData } from './ChunkScraper'
import { parseClassChunk, getTermFromClass } from './ClassScraper'

interface getDataUrlsParams {
  page: puppeteer.Page
  regex: RegExp
}

/**
 * Gets all the urls in the data class on page: page,
 * given regex: regex.
 * Each url will have the prefix: base.
 * @param { puppeteer.Page } page Page to scrape urls from
 * @param { string } base string each url has to be prefixed with
 * @param { RegExp } regex regex to check each url
 *
 * @returns { Promise<string[]> }: The list of urls on the page, prefixed with @param base
 */
const getDataUrls = async ({
  page,
  regex,
}: getDataUrlsParams): Promise<string[]> => {
  // Get all the required urls...
  // Extract urls from html
  // Remove duplicate urls using a set
  const handleEval = (elements: Element[], regex: string) => {
    const urls = elements
      .filter((ele): ele is HTMLAnchorElement => 'href' in ele)
      .map(a => {
        const link = a.href
        if (new RegExp(regex).test(link)) {
          return link
        } else {
          // Default
          return ''
        }
      })

    const cleanUrls = new Set<TimetableUrl>(urls)

    // Remove needless value
    cleanUrls.delete('')
    return [...cleanUrls]
  }

  return await page.$$eval('.data a', handleEval, regex.source)
}

/**
 * Breaks the page down into relevant chunks from which data can be extracted
 * @param { puppeteer.Page } page: page to be broken down into chunks
 *
 * @returns { Promise<PageData[]> }: Extracted data as a course info chunk and list of class chunks to be parsed
 */
const getChunks = async (page: puppeteer.Page): Promise<PageData[]> => {
  const chunks: PageData[] = await page.evaluate(() => {
    const chunkList: HTMLElement[][] = []

    const tableSelector: string = '[class="formBody"][colspan="3"]'
    const tableTagName: string = 'TABLE'

    const courseTables: NodeListOf<HTMLElement> = document.querySelectorAll(
      tableSelector
    )
    for (const course of courseTables) {
      // Get every td which has more than 1 table
      const parts = Array.from(course.children).filter(
        (element: HTMLElement) => element.tagName === tableTagName
      ) as HTMLElement[]
      if (parts.length > 1) {
        chunkList.push(parts)
      }
    }

    // Data to be returned ----> list of course objects
    const coursesDataElements: PageData[] = []

    const dataClassSelector: string = '.data'
    // Classifying each chunk of the chunklist into
    //    1. Course info chunk
    //    2. Class Chunk
    for (const course of chunkList) {
      let course_info: Chunk
      let classes: Chunk[] = []
      for (const chunk of course) {
        // If there are any data fields inside the chunk, then categorize it
        const data: HTMLElement = chunk.querySelector(dataClassSelector)
        if (data) {
          const classQuery: string = 'a[href="#top"]'
          const noteClassSelector: string = '.note'
          const pathToInnerTable: string = ':scope > tbody > tr > td > table'

          const classlist: HTMLElement = chunk.querySelector(classQuery)
          const note: HTMLElement = chunk.querySelector(noteClassSelector)
          const subtables: NodeListOf<HTMLElement> = chunk.querySelectorAll(
            pathToInnerTable
          )

          // If the table has any element with id top, then it is the classes table.
          if (classlist) {
            // The table represents a classlist!! -> the split chunks are then each element of subtables...
            // get all elements with class data from each table and then return that array.
            const tablelist: Chunk[] = []
            for (const subtable of subtables) {
              tablelist.push(
                [
                  ...subtable.querySelectorAll<HTMLElement>(dataClassSelector),
                ].map(element => element.innerText)
              )
            }
            classes = classes.concat(tablelist)
          } else if (note) {
            // The table is the summary table ---> skip!
          } else if (subtables.length === 3) {
            // This should be the course info table. --> get data elements
            course_info = [
              ...chunk.querySelectorAll<HTMLElement>(dataClassSelector),
            ].map(element => element.innerText)
          }
          // Else -> other heading tables ---> skip!
        }
      }
      if (classes.length > 0) {
        coursesDataElements.push({
          course_info: course_info,
          classes: classes,
        })
      } else {
        coursesDataElements.push({ course_info: course_info })
      }
    }
    return coursesDataElements
  })
  return chunks
}

/**
 * @constant { TermFinderReference }: Default reference to follow to find the correct term
 */
const defaultReference: TermFinderReference = [
  { term: Term.Summer, census: '1/8' },
  { term: Term.T1, census: '3/17' },
  { term: Term.T2, census: '6/30' },
  { term: Term.T3, census: '10/13' },
  { term: Term.S1, census: '3/31' },
  { term: Term.S2, census: '8/18' },
]

interface TermFinderParams {
  course: Course
  reference?: TermFinderReference
}

/**
 * Given some reference dates for the term,
 * the function returns one of the 6 terms that
 * the course can be a part of
 * [ Summer, T1, T2, T3, S1, S2 ]
 * @param { Course } course: course the term is required for
 * @param { TermFinderReference } reference The reference is optional. The default is:
 * (Convert the dates into start (month of starting)
 * and length (number of months the course runs))
 * Summer: 26/11 ---> 10/02
 * T1: 18/02 ---> 19/05
 * T2: 03/06 ---> 01/09
 * T3: 16/09 ---> 15/12
 * S1: 25/02 ---> 30/06
 * S2: 15/07 ---> 10/11
 * The date format for reference census dates is month/day
 *
 * @returns { Term[] }: List of all the terms the course runs in based on the census dates provided
 */
const termFinder = ({
  course,
  reference = defaultReference,
}: TermFinderParams): Term[] => {
  if (!course.censusDates || course.censusDates.length <= 0) {
    throw new Error('no census dates for course: ' + course.courseCode)
  }
  // For each of the census dates...add a term to the list
  const censusDates = formatDates(course.censusDates)
  const currentYear = new Date().getFullYear()

  // Add the current year to the date and convert it to a date
  // object so it can be easily parsed
  const refCensusDates = formatDates(
    reference.map(element => {
      return element.census + '/' + currentYear
    })
  )

  const termList: Term[] = []
  for (const censusDate of censusDates) {
    // minimum difference with the reference census date means the course is in that term
    let min = -1
    let index = 0
    let term: Term
    for (const refDate of refCensusDates) {
      // Calculate the difference (in days) between the
      // census date for the term and the reference census date
      const diff = Math.abs(
        Math.round(
          (censusDate.getMonth() - refDate.getMonth()) * 30 +
            censusDate.getDate() -
            refDate.getDate()
        )
      )
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

/**
 * Function scrapes all the course data on the given page
 * Returns an array of courses on the page
 * @param { puppeteer.Page } page Page to be scraped
 *
 * @returns { Promise<{ coursesData: TimetableData; warnings: Warning[] }> }: All the data on the current page, along with all the warnings found on that page
 */
const scrapePage = async (
  page: puppeteer.Page
): Promise<{ coursesData: TimetableData; warnings: Warning[] }> => {
  const coursesData: TimetableData = {
    Summer: [],
    T1: [],
    T2: [],
    T3: [],
    S1: [],
    S2: [],
    Other: [],
  }
  const warnings: Warning[] = []
  const pageChunks: PageData[] = await getChunks(page)
  // For each course chunk...
  for (const course of pageChunks) {
    // Get course code and name, that is not a chunk
    const courseHeadData = await getCourseHeadData(page)
    try {
      let course_info: CourseInfo
      const classes: ClassesByTerm = {
        Summer: [],
        T1: [],
        T2: [],
        T3: [],
        S1: [],
        S2: [],
      }
      let notes: string[]
      let noteIndex: number = 0
      let classWarns: ClassWarnings[] = []
      // There must be a course info array for any page
      if (!course.course_info) {
        throw new Error('Malformed page: ' + page.url())
      } else {
        const parsedInfo = parseCourseInfoChunk({ data: course.course_info })
        notes = parsedInfo.notes
        course_info = parsedInfo.courseInfo
      }

      // There may or may not be a classlist
      if (course.classes) {
        for (const courseClass of course.classes) {
          const parsedClassChunk = parseClassChunk({ data: courseClass })
          if (parsedClassChunk) {
            classes[
              getTermFromClass({
                cls: parsedClassChunk.classData,
              })
            ].push(parsedClassChunk.classData)

            // Get the warnings
            classWarns.push.apply(classWarns, parsedClassChunk.warnings)
          }
        }

        for (const term of keysOf(classes)) {
          if (!classes[term] || classes[term].length === 0) {
            continue
          }
          const courseData: Course = {
            ...courseHeadData,
            ...course_info,
            classes: classes[term],
          }

          if (notes[noteIndex] && notes[noteIndex] != ' ') {
            courseData.notes = [notes[noteIndex]]
            noteIndex++
          } else {
            delete courseData.notes
          }

          coursesData[term].push(courseData)
        }
      } else {
        // In case there is no class list then dont include the parameter
        const courseData: Course = {
          ...courseHeadData,
          ...course_info,
          notes: notes,
        }

        coursesData.Other.push(courseData)
      }

      // Encapsulate the classWarnings into warnings for the course
      for (const classWarn of classWarns) {
        const courseWarning: Warning = {
          courseCode: courseHeadData.courseCode,
          courseName: courseHeadData.name,
          ...classWarn,
        }
        warnings.push(courseWarning)
      }
    } catch (err) {
      console.log(courseHeadData.courseCode + ' ' + courseHeadData.name)
      throw new Error(err)
    }
  }
  return { coursesData, warnings }
}

export { getDataUrls, getDataUrlsParams, scrapePage, termFinder, getChunks }
