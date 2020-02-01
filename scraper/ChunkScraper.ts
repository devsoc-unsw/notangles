import * as puppeteer from 'puppeteer'

import { transformHtmlSpecials } from './helper'
import { Chunk, CourseHead, CourseInfo, Career } from './interfaces'

/**
 * Gets the data from the title of the course (course code, name)
 *
 * @param { puppeteer.Page } page: page which displays the data to scrape
 * @returns { Promise<CourseHead> }: Data about the title of the course: The course code and the course name
 */
const getCourseHeadData = async (page: puppeteer.Page): Promise<CourseHead> => {
  const data = await page.evaluate(() => {
    const courseHeader = document.getElementsByClassName(
      'classSearchMinorHeading'
    )[0].innerHTML
    const headerRegex = /(^[A-Z]{4}[0-9]{4})(.*)/
    return headerRegex.exec(courseHeader)
  })
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
 * Scrapes all information, given a data array from a chunk that contains course information for one course
 *
 * @param { Chunk } data: Data array that contains the course information
 * @returns { { notes: string[]; courseInfo: CourseInfo } }: A CourseInfo object containing data about the course and a list of notes on the page, if any.
 */
const parseCourseInfoChunk = (
  data: Chunk
): { notes: string[]; courseInfo: CourseInfo } => {
  let index = 0

  // Faculty not needed
  index++

  // School
  const school = data[index]
  // School is a string
  if (!school || school === ' ') {
    throw new Error('Invalid School: ' + school)
  }
  index++

  // Skip online handbook record
  index++

  // campus location
  const campus = data[index]
  if (!campus || campus === ' ') {
    throw new Error('Invalid Campus: ' + campus)
  }
  index++

  // Career type
  const career: Career = <Career>data[index]
  if (!(career && Object.values(Career).includes(career))) {
    throw new Error('Invalid Career: ' + career)
  }
  index++

  const termsOffered: string[] = []
  const censusDates: string[] = []
  let notes: string[] = []
  // Find all the terms the course runs in
  while (index < data.length) {
    // Term regex -> letter, letter or number, optional letter or number
    const termFinderRegex = /^[A-Z][A-Z0-9][A-Z0-9]?$/
    if (termFinderRegex.test(data[index])) {
      termsOffered.push(data[index])
    }

    // Look for the census dates in case there is no class to extract dates from
    const censusDateFinder = /^[0-9]+-[A-Z]+-[0-9]+$/
    if (censusDateFinder.test(data[index])) {
      censusDates.push(data[index])
      notes.push(data[index + 1])
    }
    index++
  }

  const courseInfo: CourseInfo = {
    school: school,
    campus: campus,
    career: career,
    termsOffered: termsOffered,
    censusDates: censusDates,
  }

  return { notes: notes, courseInfo }
}

export { getCourseHeadData, parseCourseInfoChunk }
