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

/**
 * Extracts the elements hrefs that contain urls from the html element array
 * @param { Element[] } elements: Elements on the page
 * @returns { string[] }: Hrefs of all 'a' tags in the elements list
 */
const extractHrefsFromPage = (elements: Element[]): string[] => {
  return elements
    .filter((ele): ele is HTMLAnchorElement => 'href' in ele)
    .map(element => element.href)
}

interface FilterUrlsParams {
  elements: string[]
  regex: RegExp
}

/**
 * Filters the urls from list of hrefs of 'a' tags using the regex
 * @param elements: Array of hrefs of 'a' tags that contain urls to extract
 * @param regex: Regexp to find the urls
 * @returns { TimetableUrl[] }: List of urls of urls matching the regex
 */
const filterUrls = ({ elements, regex }: FilterUrlsParams): TimetableUrl[] => {
  const urls: TimetableUrl[] = elements.filter(url => regex.test(url))
  const cleanUrls = new Set<TimetableUrl>(urls)
  return [...cleanUrls]
}

interface getUrlsParams {
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
 * @returns { Promise<TimetableUrl[]> }: The list of urls on the page, prefixed with @param base
 */
const getUrls = async ({
  page,
  regex,
}: getUrlsParams): Promise<TimetableUrl[]> => {
  const elements = await page.$$eval('.data a', extractHrefsFromPage)
  return filterUrls({ elements, regex })
}

/**
 * Parses the tables on the page, extracts the courses on the page as chunks
 * @param { HTMLElement[] } elements: List of table elements on the page that need to be parsed
 * @returns { PageData[] }: List of course chunks, classified as a pageData object
 */
const parsePage = (elements: HTMLElement[]): PageData[] => {
  /**
   * Extracts the tables on the page containing course data
   * @param { HTMLElement[] } courseTables: List of all the tables on the page
   * @returns { HTMLElement[][] }: List of elements that contain data about a course, group together so each list only contains chunks relevant to one course
   */
  const getCourseElements = (courseTables: HTMLElement[]): HTMLElement[][] => {
    const elementList: HTMLElement[][] = []
    const tableTagName: string = 'TABLE'

    for (const course of courseTables) {
      // Get every td which has more than 1 table
      const subtables = [...course.children].filter(
        (element: HTMLElement): element is HTMLElement =>
          element.tagName === tableTagName
      )
      if (subtables.length > 1) {
        elementList.push(subtables)
      }
    }

    return elementList
  }

  interface GetClassTablesParams {
    subtables: NodeListOf<HTMLElement>
    dataClassSelector: string
  }

  /**
   * Extracts all the classChunks from the page
   * @param { NodeListOf<HTMLElement> } subtables: List of table elements that contain one class chunk each
   * @param { string } dataClassSelector: selector to extract elements with the data class
   * @returns { Chunk[] }: List of class chunks that were extracted
   */
  const getClassTables = ({
    subtables,
    dataClassSelector,
  }: GetClassTablesParams): Chunk[] => {
    // The table represents a classlist!! -> the split chunks are then each element of subtables...
    // get all elements with class data from each table and then return that array.
    const tablelist: Chunk[] = []
    for (const subtable of subtables) {
      tablelist.push(
        [...subtable.querySelectorAll<HTMLElement>(dataClassSelector)].map(
          (element: HTMLElement) => element.innerText
        )
      )
    }
    return tablelist
  }

  interface GetCourseInfoChunkParams {
    courseInfoElement: HTMLElement
    dataClassSelector: string
  }

  /**
   * Extracts course info chunk from the page
   * @param { HTMLElement } courseInfoElement: The dom element that contains the courseInfo chunk
   * @param { string } dataClassSelector: selector to extract dom elements with the data class
   * @returns { Chunk }: Extracted courseInfo chunk
   */
  const getCourseInfoChunk = ({
    courseInfoElement,
    dataClassSelector,
  }: GetCourseInfoChunkParams): Chunk => {
    // This should be the course info table. --> get data elements
    return [
      ...courseInfoElement.querySelectorAll<HTMLElement>(dataClassSelector),
    ].map(element => element.innerText)
  }

  /**
   * Checks if the element contains a class chunk or not
   * @param { HTMLElement } element: Chunk to be checked
   * @returns { boolean }: true, if the element contains a class chunk, otherwise false
   */
  const hasClassChunk = (element: HTMLElement): boolean => {
    // If the table has any element with id top, then it is the classes table.
    const classQuery: string = 'a[href="#top"]'
    const classlist: HTMLElement = element.querySelector(classQuery)
    return classlist !== null
  }

  /**
   * Checks if the element has a note and no useful data
   * @param { HTMLElement } element: The dom element to be checked
   * @returns { boolean }: true, if the element has a note dom element, false otherwise
   */
  const isNoteElement = (element: HTMLElement): boolean => {
    const noteClassSelector: string = '.note'
    const note: HTMLElement = element.querySelector(noteClassSelector)
    return note !== null
  }

  /**
   * Checks if the subtables indicate that the parent might contain a course info chunk
   * @param { NodeListOf<HTMLElement> } subtables: The subtables that might be part of the table element that contains a courseInfoChunk
   * @returns { boolean }: true, if the parent contains a course info chunk, false otherwise
   */
  const hasCourseInfoChunk = (subtables: NodeListOf<HTMLElement>): boolean => {
    return subtables.length === 3
  }

  interface ExtractChunksReturn {
    courseInfoChunk?: Chunk
    classChunks?: Chunk[]
  }

  /**
   * Extracts the course info and class chunks (if present) from the element
   * @param { HTMLElement } element: Dom element to extract chunks from
   * @returns { ExtractChunksReturn }: The extracted course info and class chunks, if found
   */
  const extractChunks = (element: HTMLElement): ExtractChunksReturn => {
    const dataClassSelector: string = '.data'
    const pathToInnerTable: string = ':scope > tbody > tr > td > table'
    const subtables: NodeListOf<HTMLElement> = element.querySelectorAll(
      pathToInnerTable
    )

    if (hasClassChunk(element)) {
      return { classChunks: getClassTables({ subtables, dataClassSelector }) }
    } else if (isNoteElement(element)) {
      // The table is the summary table ---> skip!
    } else if (hasCourseInfoChunk(subtables)) {
      return {
        courseInfoChunk: getCourseInfoChunk({
          courseInfoElement: element,
          dataClassSelector,
        }),
      }
    }
    // Else -> other heading tables ---> skip!

    // Default
    return {}
  }

  /**
   * Extracts chunks from list of elements relating to a single course
   * @param { HTMLElement[]} elements: list of elements relating to a single course
   * @returns { PageData }: extracted courseInfo and courseClasses chunks, formatted as a PageData object
   */
  const parseCourse = (elements: HTMLElement[]): PageData => {
    const dataClassSelector: string = '.data'

    const courseClasses: Chunk[] = []
    let courseInfo: Chunk
    for (const element of elements) {
      // If there are any data fields inside the chunk, then categorize it
      const data: HTMLElement = element.querySelector(dataClassSelector)
      if (data) {
        const { classChunks, courseInfoChunk } = extractChunks(element)

        if (courseInfoChunk) {
          courseInfo = courseInfoChunk
        }

        if (classChunks?.length > 0) {
          courseClasses.push(...classChunks)
        }
      }
    }

    return { courseInfo, courseClasses }
  }

  const courseElements = getCourseElements(elements)
  const pageChunks: PageData[] = []

  for (const element of courseElements) {
    const { courseInfo, courseClasses } = parseCourse(element)

    if (courseClasses.length > 0) {
      pageChunks.push({
        courseInfo,
        courseClasses,
      })
    } else {
      pageChunks.push({ courseInfo })
    }
  }
  return pageChunks
}

/**
 * Breaks the page down into relevant chunks from which data can be extracted
 * @param { puppeteer.Page } page: page to be broken down into chunks
 * @returns { Promise<PageData[]> }: Extracted data as a course info chunk and list of class chunks to be parsed
 */
const getChunks = async (page: puppeteer.Page): Promise<PageData[]> => {
  const tableSelector: string = '[class="formBody"][colspan="3"]'
  return await page.$$eval(tableSelector, parsePage)
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
    reference.map(element => element.census + '/' + currentYear)
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
      if (!course.courseInfo) {
        throw new Error('Malformed page: ' + page.url())
      } else {
        const parsedInfo = parseCourseInfoChunk({ data: course.courseInfo })
        notes = parsedInfo.notes
        course_info = parsedInfo.courseInfo
      }

      // There may or may not be a classlist
      if (course.courseClasses) {
        for (const courseClass of course.courseClasses) {
          const parsedClassChunk = parseClassChunk({
            data: courseClass,
          })
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

export { getUrls, getUrlsParams, scrapePage, termFinder, getChunks }
