import * as puppeteer from 'puppeteer'

import { transformHtmlSpecials } from '../../helper'
import { Chunk, CourseHead, CourseInfo, Career } from '../../interfaces'

/**
 * Extracts the course header information, and splits it into the course code and name
 * @param { puppeteer.Page } page: Page that is to be evaluated
 * @returns { RegExpExecArray }: Runs the regex to extract data on the extracted data and returns the array
 */
const extractCourseHeadFromPage = async (
  page: puppeteer.Page
): Promise<RegExpExecArray> => {
  return await page.evaluate(() => {
    // Get the course code and course name
    const courseHeader = document.getElementsByClassName(
      'classSearchMinorHeading'
    )[0].innerHTML
    const headerRegex = /(^[A-Z]{4}[0-9]{4})(.*)/
    return headerRegex.exec(courseHeader)
  })
}

/**
 * Gets the data from the title of the course (course code, name)
 * @param { puppeteer.Page } page: page which displays the data to scrape
 * @returns { Promise<CourseHead> }: Data about the title of the course: The course code and the course name
 */
const getCourseHeadData = async (page: puppeteer.Page): Promise<CourseHead> => {
  const data = await extractCourseHeadFromPage(page)
  // There must be at least 3 elements in courseHead
  if (!(data && data.length > 2)) {
    throw new Error('Malformed course header: ' + data)
  }
  const courseHead: CourseHead = {
    courseCode: data[1].trim(),
    name: transformHtmlSpecials(data[2].trim()),
  }
  return courseHead
}

/**
 * Extracts the name of the school that offers the course that is being parsed
 * @param school: Line that contains data about the school field
 * @returns { string }: The school that offers the current course
 */
const getSchool = (school: string): string => {
  // School is a string
  if (!school || school === ' ') {
    throw new Error('Invalid School: ' + school)
  }

  return school
}

/**
 * Extracts data about which campus the course runs at
 * @param campus: Line that contains data about the campus location
 * @returns { string }: The campus location that was found
 */
const getCampusLocation = (campus: string): string => {
  if (!campus || campus === ' ') {
    throw new Error('Invalid Campus: ' + campus)
  }

  return campus
}

/**
 * Extracts the career from the line
 * @param data: Line that contains data about the career (see the career interface for more details)
 * @returns { Career }: The career that the course is aimed at
 */
const getCareer = (data: string): Career => {
  const career = <Career>data
  if (!(career && Object.values(Career).includes(career))) {
    const career2: Career = <Career>data.split(' ')[0]
    if (!(career2 && Object.values(Career).includes(career2))) {
      throw new Error('Invalid Career: ' + career)
    } else {
      console.log(
        'Warning: Career: "' +
          career +
          '" is not in the list of legitimate careers'
      )
    }
  }

  return career
}

/**
 * Checks if the current line is the term the course runs in or not
 * @param data: Line that might contain data about the Term field
 * @returns { boolean }: true if the line contains the term the course runs in, false otherwise
 */
const isTerm = (data: string): boolean => {
  // Term regex -> letter, letter or number, optional letter or number
  const termFinderRegex = /^[A-Z][A-Z0-9][A-Z0-9]?$/
  return termFinderRegex.test(data)
}

/**
 * Checks if the current line contains the census date
 * @param data: Line that might be the census date
 * @returns { boolean }: true if the line contains the census date, false otherwise
 */
const isCensusDate = (data: string): boolean => {
  // Look for the census dates in case there is no class to extract dates from
  const censusDateFinder = /^[0-9]+-[A-Z]+-[0-9]+$/
  return censusDateFinder.test(data)
}

/**
 * @interface: Indices of all the data that can be extracted from the courseInfo chunk
 */
interface CourseInfoIndices {
  facultyIndex?: number
  schoolIndex: number
  onlineHandbookRecordIndex?: number
  campusIndex: number
  careerIndex: number
  nextParseIndex: number // Index to start looking for term, censusDates and notes information
}

interface parseCourseInfoChunkParams {
  chunk: Chunk
  parseIndices?: CourseInfoIndices
}

interface parseCourseInfoChunkReturn {
  notes: string[]
  courseInfo: CourseInfo
}

/**
 * @constant { CourseInfoIndices }: Default indices which represent which index to grab data from.
 * The schoolIndex is not 0 because there is a column for an &nbsp in the table
 */
const defaultParseIndices: CourseInfoIndices = {
  schoolIndex: 1,
  campusIndex: 3,
  careerIndex: 4,
  nextParseIndex: 5,
}

/**
 * Scrapes all information, given a data array from a chunk that contains
 * course information for one course
 * @param { Chunk } chunk: Data array that contains the course information
 * @returns { { notes: string[]; courseInfo: CourseInfo } }: A CourseInfo object containing data about the course and a list of notes on the page, if any.
 */
const parseCourseInfoChunk = ({
  chunk,
  parseIndices = defaultParseIndices,
}: parseCourseInfoChunkParams): parseCourseInfoChunkReturn => {
  const data = chunk.data
  const school = getSchool(data[parseIndices.schoolIndex])
  const campus = getCampusLocation(data[parseIndices.campusIndex])
  const career = getCareer(data[parseIndices.careerIndex])

  let index = parseIndices.nextParseIndex
  const termsOffered: string[] = []
  const censusDates: string[] = []
  const notes: string[] = []
  // Find all the terms the course runs in
  while (index < data.length) {
    if (isTerm(data[index])) {
      termsOffered.push(data[index])
    }

    if (isCensusDate(data[index])) {
      censusDates.push(data[index])
      notes.push(data[index + 1])
    }
    index++
  }

  const courseInfo: CourseInfo = {
    school,
    campus,
    career,
    termsOffered,
    censusDates,
  }

  return { notes, courseInfo }
}

export { getCourseHeadData, parseCourseInfoChunk }
