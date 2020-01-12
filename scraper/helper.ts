import { Browser, Page } from 'puppeteer'

import { WarningTag, ClassWarnings } from './interfaces'

/**
 * Remove any html character entities from the given string
 * At this point, it only looks for 3 of them as more are not necessary
 * @param { string } string The string to remove html characters from
 *
 * @returns { string }: string with html special characters replaced with english versions of said symbols
 *
 * @example
 *
 *    const clean = removeHtmlSpecials('&amp;') // 'and'
 */
const removeHtmlSpecials = (str: string) => {
  // &amp --> and
  let newstr = str.replace('&amp;', 'and')

  // &nbsp ---> nothing (as it appears in course enrolment when the course does not have one)
  newstr = newstr.replace('&nbsp;', '')

  // &lt --> < (less than), this could be changed to before??
  newstr = newstr.replace('&lt;', '<')

  // There was no greater than sign found, but if neccessary, can be added here

  return newstr
}

/**
 * Converts dates into date objects
 * @param { string[] } dateList: list of census dates to be formatted to utc time
 *
 * @returns { Date[] }: List of dates converted to Date objects
 *
 * @example
 *
 *    const formatted = formatDates(['01/27/2020']) // Date('01/27/2020')
 */
const formatDates = (dateList: string[]): Date[] => {
  return dateList.map(date => new Date(date + 'Z'))
}

interface reverseDayAndMonthParams {
  date: string
  delimiter: string
}

/**
 * Reverses the day and month order of the date so that it can be
 * robustly formated into a Date object using the formatDates() method
 * @param { string } date: Date whose day and month is to be reversed
 * @param { string } delimiter: delimiter separating date fields
 *
 * @returns { string }: Date with day and month reversed
 * @example
 *    const rev = reverseDayAndMonth({date: '27/01/2020', delimiter: '/'}) // '01/27/2020'
 */
const reverseDayAndMonth = ({
  date,
  delimiter,
}: reverseDayAndMonthParams): string => {
  const splitDate = date.split(delimiter)
  return [splitDate[1], splitDate[0], splitDate[2]].join(delimiter)
}

/**
 * Returns a list of keys for an object
 * @param { T } obj: Object to return a list of keys for
 *
 * @returns { (keyof T)[] }: List of keys of @param obj
 * @example
 *    const keys = keysOf({'foo', 'bar'}) // ['foo']
 */
const keysOf = <T extends {}>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[]

interface createPagesParams {
  browser: Browser
  batchsize: number
}

/**
 * Creates browser pages to then use to scrape the website
 * @param { Browser } browser: browser object (window) in which to create new pages
 * @param { number } batchsize: Number of pages to be created
 *
 * @returns { Promise<Page[]> }: List of pages created
 */
const createPages = async ({
  browser,
  batchsize,
}: createPagesParams): Promise<Page[]> => {
  // List of pages
  const pages: Page[] = []
  for (let pageno = 0; pageno < batchsize; pageno++) {
    const singlepage = await browser.newPage()
    // Block all js, css, fonts and images for speed
    await singlepage.setRequestInterception(true)
    singlepage.on('request', request => {
      const type = request.resourceType()
      if (type === 'document') {
        request.continue()
      } else {
        request.abort()
      }
    })
    pages.push(singlepage)
  }
  return pages
}

interface makeClassWarningParams {
  classID: number
  term: string
  errorKey: string
  errorValue: unknown
  tag?: WarningTag
}

/**
 * Takes in details about an errer and creates a classWarnings object for it
 * @param { number } classID ID of erroneous class
 * @param { string } term Term in which the erroneous class is
 * @param { string } errorKey Key that is not conforming
 * @param { unknown } errorValue The invalid value of the key
 * @param { WarningTag } tag Warning tag to indicate details of the error
 *
 * @returns { ClassWarnings }: Created ClassWarnings object
 */
const makeClassWarning = ({
  classID,
  term,
  errorKey,
  errorValue,
  tag = WarningTag.Other,
}: makeClassWarningParams): ClassWarnings => {
  const warn: ClassWarnings = {
    tag: tag,
    classID: classID,
    term: term,
    error: {
      key: errorKey,
      value: errorValue,
    },
  }
  return warn
}

export {
  removeHtmlSpecials,
  formatDates,
  reverseDayAndMonth,
  keysOf,
  createPages,
  makeClassWarning,
}
