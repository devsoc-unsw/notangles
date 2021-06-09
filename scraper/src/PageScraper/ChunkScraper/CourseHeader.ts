import { Page } from 'puppeteer'

import { CourseHead } from '../../interfaces'
import { transformHtmlSpecials } from './ClassScraper/ClassHelpers/TransformHtmlSpecials'

/**
 * Extracts the course header information, and splits it into the course code and name
 * @param { puppeteer.Page } page: Page that is to be evaluated
 * @returns { RegExpExecArray }: Runs the regex to extract data on the extracted data and returns the array
 */
const extractCourseHeadFromPage = async (
  page: Page
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
const getCourseHeadChunk = async (page: Page): Promise<CourseHead> => {
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

export { getCourseHeadChunk }
