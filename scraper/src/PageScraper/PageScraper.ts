import * as puppeteer from 'puppeteer'

import {
  Chunk,
  PageData,
  Course,
  CourseWarning,
  TimetableData,
  CourseInfo,
  CourseHead,
} from '../interfaces'
import { keysOf } from '../ScraperHelpers/KeysOf'
import { getCourseHeadChunk } from './ChunkScraper/CourseHeader'
import { parseCourseInfoChunk } from './ChunkScraper/CourseInfo'
import { parsePage } from './ParsePage'
import { parseNotes } from './PageHelpers/GetNotes'
import { getClassesByTerm } from './PageHelpers/GetClassesByTerm'
import { getCourseWarningsFromClassWarnings } from './PageHelpers/GetCourseWarnings'

/**
 * Breaks the page down into relevant chunks from which data can be extracted
 * @param { puppeteer.Page } page: page to be broken down into chunks
 * @returns { Promise<PageData[]> }: Extracted data as a course info chunk and list of class chunks to be parsed
 */
const getChunks = async (page: puppeteer.Page): Promise<PageData[]> => {
  const tableSelector: string = '[class="formBody"][colspan="3"]'
  return await page.$$eval(tableSelector, parsePage)
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
      courseHead = await getCourseHeadChunk(page)
      const parsedData = getCourseInfoAndNotes({
        courseInfo: course.courseInfo,
        url: page.url(),
      })
      const courseInfo = parsedData.courseInfo
      const notes = parseNotes(parsedData.notes)

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

export { scrapePage, getChunks }
