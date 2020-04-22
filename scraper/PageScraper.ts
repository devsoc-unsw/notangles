import * as puppeteer from 'puppeteer'

import {
  TimetableUrl,
  Chunk,
  PageData,
  Term,
  Course,
  CourseWarning,
  ClassWarnings,
  ClassesByTerm,
  TimetableData,
  CourseInfo,
  GetTermFromCourseReference,
  CourseHead,
  ClassChunk,
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
 * Gets all the urls in the data class on page: page matching regex
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

  /**
   * Finds and extracts notes from the class chunk
   * Relies on the fact that notes follow "Class Notes" header
   * @param subtable: Table tag equivalent to a class chunk
   */
  const getClassNotes = (subtable: HTMLElement): string[] => {
    const notes = [
      ...subtable.querySelectorAll<HTMLElement>(
        'td.label[colspan="5"], font[color="red"]'
      ),
    ].map(note => note.innerText)
    const noteStartIndex = notes.indexOf('Class Notes')
    let noteCount = 0
    let classNotes: string[] = []
    if (noteStartIndex > -1) {
      noteCount = noteStartIndex > -1 ? notes.length - 1 - noteStartIndex : 0
      classNotes = noteCount > 0 ? notes.splice(noteStartIndex + 1) : []
    }

    return classNotes
  }

  interface GetClassTablesParams {
    subtables: NodeListOf<HTMLElement>
    dataClassSelector: string
  }

  /**
   * Extracts all the classChunks from the page
   * @param { NodeListOf<HTMLElement> } subtables: List of table elements that contain one class chunk each
   * @param { string } dataClassSelector: selector to extract elements with the data class
   * @returns { ClassChunk[] }: List of class chunks that were extracted
   */
  const getClassTables = ({
    subtables,
    dataClassSelector,
  }: GetClassTablesParams): ClassChunk[] => {
    // The table represents a classlist!! -> the split chunks are then each element of subtables...

    // const notes = getClassesNotes(subtables)
    const tablelist: ClassChunk[] = []
    for (const subtable of subtables) {
      // classNotes.push(getClassNotes(subtable))
      const data = [
        ...subtable.querySelectorAll<HTMLElement>(dataClassSelector),
      ].map((element: HTMLElement) => element.innerText)
      const notes = getClassNotes(subtable)
      tablelist.push({
        data: data.slice(0, data.length - notes.length),
        notes,
      })
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
    return {
      data: [
        ...courseInfoElement.querySelectorAll<HTMLElement>(dataClassSelector),
      ].map(element => element.innerText),
    }
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
    classChunks?: ClassChunk[]
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
      return {
        classChunks: getClassTables({ subtables, dataClassSelector }),
      }
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

    let courseClasses: ClassChunk[] = []
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

    if (courseClasses?.length > 0) {
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

interface GetCourseInfoAndNotesParams {
  courseInfo: Chunk
  url: string
}

interface GetCourseInfoAndNotesReturn {
  courseInfo: CourseInfo
  notes: string[]
}

/**
 * Wrapper to check course info chunk before parsing it
 * @param { CourseInfo } courseInfo: CourseInfo chunk to be checked
 * @param { string } url: Url of the page the courseInfo chunk is on
 * @returns { GetCourseInfoAndNotesReturn }: The parsed courseInfo object and the extracted notes array
 */
const getCourseInfoAndNotes = ({
  courseInfo,
  url,
}: GetCourseInfoAndNotesParams): GetCourseInfoAndNotesReturn => {
  if (!courseInfo) {
    throw new Error('Malformed page: ' + url)
  }
  return parseCourseInfoChunk({ chunk: courseInfo })
}

/**
 * Check each extracted note
 * @param { string[] } notes: Raw notes array
 * @returns { string [] }: All the valid notes found on the page
 */
const getNotes = (notes: string[]): string[] => {
  const cleanNotes: string[] = []
  for (const note of notes) {
    if (note) {
      cleanNotes.push(note)
    }
  }
  return cleanNotes
}

interface GetClassesByTermReturn {
  classes: ClassesByTerm
  classWarnings: ClassWarnings[]
}

/**
 * Convert class chunks into class objects and classify them into terms
 * @param { Chunk[] } courseClasses: List of raw class chunks
 * @returns { GetClassesByTermReturn }: Parsed class objects, along with any warnings that occured during parsing
 */
const getClassesByTerm = (
  courseClasses: ClassChunk[]
): GetClassesByTermReturn => {
  const classes: ClassesByTerm = {
    Summer: [],
    T1: [],
    T2: [],
    T3: [],
    S1: [],
    S2: [],
    Other: [],
  }
  const classWarnings: ClassWarnings[] = []
  for (const courseClass of courseClasses) {
    const parsedClassChunk = parseClassChunk({
      chunk: courseClass,
    })
    if (parsedClassChunk) {
      classes[
        getTermFromClass({
          cls: parsedClassChunk.classData,
        })
      ].push(parsedClassChunk.classData)

      classWarnings.push(...parsedClassChunk.warnings)
    }
  }

  return { classes, classWarnings }
}

interface GetCourseWarningsFromClassWarnings {
  classWarnings: ClassWarnings[]
  courseHead: CourseHead
}

/**
 * Converts class warnings to course warnings to give more information for debugging
 * @param { CourseHead } courseHead: The course name and course code required for the conversion as a course head object
 * @param { ClassWarnings } classWarnings: The classwarnings to be converted
 * @returns { CourseWarning[] }
 */
const getCourseWarningsFromClassWarnings = ({
  classWarnings,
  courseHead,
}: GetCourseWarningsFromClassWarnings): CourseWarning[] => {
  if (!courseHead) {
    throw new Error('Invalid course code and name')
  }

  // Encapsulate the classWarnings into courseWarnings for the course
  // by adding
  const courseWarnings: CourseWarning[] = []
  for (const classWarn of classWarnings) {
    const courseWarning: CourseWarning = {
      courseCode: courseHead.courseCode,
      courseName: courseHead.name,
      ...classWarn,
    }
    courseWarnings.push(courseWarning)
  }

  return courseWarnings
}

interface ScrapePageReturnSync {
  coursesData: TimetableData
  courseWarnings: CourseWarning[]
}

type ScrapePageReturn = Promise<ScrapePageReturnSync>

/**
 * Function scrapes all the course data on the given page
 * Returns an array of courses on the page
 * @param { puppeteer.Page } page Page to be scraped
 * @returns { ScrapePageReturn }: All the data on the current page, along with all the courseWarnings found on that page
 */
const scrapePage = async (page: puppeteer.Page): ScrapePageReturn => {
  const coursesData: TimetableData = {
    Summer: [],
    T1: [],
    T2: [],
    T3: [],
    S1: [],
    S2: [],
    Other: [],
  }
  const courseWarnings: CourseWarning[] = []
  const pageChunks: PageData[] = await getChunks(page)

  for (const course of pageChunks) {
    if (!course) {
      continue
    }

    let courseHead: CourseHead
    try {
      // Get course code and name, that is not a chunk
      courseHead = await getCourseHeadData(page)
      const parsedData = getCourseInfoAndNotes({
        courseInfo: course.courseInfo,
        url: page.url(),
      })
      const courseInfo = parsedData.courseInfo
      const notes = getNotes(parsedData.notes)

      // There may or may not be a classlist
      if (course.courseClasses) {
        const { classes, classWarnings } = getClassesByTerm(
          course.courseClasses
        )
        for (const term of keysOf(classes)) {
          if (!classes[term] || classes[term].length === 0) {
            continue
          }
          const courseData: Course = {
            ...courseHead,
            ...courseInfo,
            classes: classes[term],
          }

          if (notes) {
            courseData.notes = notes
          }

          coursesData[term].push(courseData)
        }
        courseWarnings.push(
          ...getCourseWarningsFromClassWarnings({ classWarnings, courseHead })
        )
      } else {
        const courseData: Course = {
          ...courseHead,
          ...courseInfo,
        }

        if (notes) {
          courseData.notes = notes
        }

        coursesData.Other.push(courseData)
      }
    } catch (err) {
      // Display the course name and code before deferring to parent
      console.log(err)
      console.log(courseHead.courseCode + ' ' + courseHead.name)
      throw new Error(err)
    }
  }
  return { coursesData, courseWarnings }
}

export { getUrls, getUrlsParams, scrapePage, getTermFromCourse, getChunks }
