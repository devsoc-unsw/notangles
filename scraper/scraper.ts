import * as puppeteer from 'puppeteer'
import { TimetableData, UrlList, ExtendedTerm, warning } from './interfaces'

import { getDataUrls, scrapePage, termFinder } from './PageScraper'
import { keysOf } from './helper'
import { cloneDeep } from 'lodash'

/**
 * Creates browser pages to then use to scrape the website
 * @param browser: browser object (window) in which to create new pages
 * @param batchsize: Number of pages to be created
 */
const createPages = async (
  browser: puppeteer.Browser,
  batchsize: number
): Promise<puppeteer.Page[]> => {
  // List of pages
  const pages: puppeteer.Page[] = []
  for (let pageno = 0; pageno < batchsize; pageno++) {
    const singlepage = await browser.newPage()
    // Block all js, css, fonts and images for speed
    await singlepage.setRequestInterception(true)
    singlepage.on('request', request => {
      const type = request.resourceType()
      if (
        type === 'script' ||
        type === 'stylesheet' ||
        type === 'font' ||
        type === 'image'
      ) {
        request.abort()
      } else {
        request.continue()
      }
    })
    pages.push(singlepage)
  }
  return pages
}

/**
 * Async wrapper to scrape multiple subjects at once
 * This scrapes one subject
 * @param page Page to use to scrape the subject
 * @param course Url of the course to be scraped
 */
const scrapeSubject = async (
  page: puppeteer.Page,
  course: string
): Promise<{ coursesData: TimetableData; warnings: warning[] }> => {
  await page.goto(course, {
    waitUntil: 'networkidle2',
  })

  // Get all relevant data for one page
  return await scrapePage(page)
}

/**
 * Gets all the urls on the current page matching the given regex
 * (This function is only an async puppeteer wrapper)
 * @param url Url of the page to scrape
 * @param page page to be used for scraping
 * @param base prefix for each scraped url
 * @param regex regex to check each scraped url
 */
const getPageUrls = async (
  url: string,
  page: puppeteer.Page,
  base: string,
  regex: RegExp
): Promise<string[]> => {
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  // Then, get each data url on that page
  return await getDataUrls(page, base, regex)
}

/**
 * The scraper that scrapes the timetable site
 */
const timetableScraper = async (
  year: number
): Promise<{ timetableData: TimetableData; warnings: warning[] }> => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch({ headless: false })
  try {
    const batchsize = 50
    // Create batchsize pages to scrape each course
    const pages = await createPages(browser, batchsize)
    let page = pages[0]
    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`

    // JSON Array to store the course data.
    // There are no cases which cannot be classified. (Yet)
    const timetableData: TimetableData = {
      Summer: [],
      T1: [],
      T2: [],
      T3: [],
      S1: [],
      S2: [],
    }

    // Warning array for any fields not aligning with the strict requirements
    const warnings: warning[] = []

    // Go to the page with list of subjects (Accounting, Computers etc)
    await page.goto(base, {
      waitUntil: 'networkidle2',
    })

    // Defining the regex for course scraping...
    const courseUrlRegex = /([A-Z]{8})\.html/

    // Gets all the dataurls on the timetable page.
    const urlList = await getDataUrls(page, base, courseUrlRegex)

    // Defining the regex for each of the subject codes...
    const subjectUrlRegex = /([A-Z]{4}[0-9]{4})\.html/

    // Jobs -> urls of each subject
    let jobs: UrlList = []

    // Scrape all the urls from the subject pages (eg: COMPKENS, etc)
    for (let url = 0; url < urlList.length; ) {
      // List of promises that are being resolved
      const promises: Promise<string[]>[] = []
      // array of resolved promises from the promises array
      let result: UrlList[] = []

      // Open a different url on a different page
      for (let i = 0; i < batchsize && url < urlList.length; i++) {
        const urls = getPageUrls(urlList[url], pages[i], base, subjectUrlRegex)
        promises.push(urls)
        url++
      }
      // Wait for all the pages
      result = await Promise.all(promises)

      // Then add them to the jobs queue
      for (const pageurls of result) {
        jobs = jobs.concat(pageurls)
      }
    }

    // Now scrape each page in the jobs queue and then add it to the scraped
    // array
    for (let job = 0; job < jobs.length; ) {
      const promises: Promise<{
        coursesData: TimetableData
        warnings: warning[]
      }>[] = []
      let result: { coursesData: TimetableData; warnings: warning[] }[]
      for (let i = 0; i < batchsize && job < jobs.length; i++) {
        const data = scrapeSubject(pages[i], jobs[job])
        promises.push(data)
        job++
      }
      // Wait for all the pages
      result = await Promise.all(promises)

      for (const element of result) {
        warnings.push.apply(warnings, element.warnings)
        for (const scrapedTerm of keysOf(element.coursesData)) {
          // Each termlist may contain multiple courses
          for (const scrapedCourse of element.coursesData[scrapedTerm]) {
            if (!scrapedCourse) {
              console.log(element, 'Error in result: ', result)
              throw new Error()
            }
            // If the term is in the other list, then it has no classes. Classify it!
            if (scrapedTerm === ExtendedTerm.Other) {
              const termlist = termFinder(scrapedCourse)
              const notes = scrapedCourse.notes
              let noteIndex = 0
              for (const term of termlist) {
                if (notes[noteIndex] && notes[noteIndex] != ' ') {
                  scrapedCourse.notes = [notes[noteIndex]]
                } else {
                  delete scrapedCourse.notes
                }

                timetableData[term].push({
                  ...cloneDeep(scrapedCourse),
                })
              }
            } else {
              // If the term is already assigned then just add it to the respective term.
              timetableData[scrapedTerm].push(scrapedCourse)
            }
          }
        }
      }
    }

    // Close the browser.
    await browser.close()
    return { timetableData: timetableData, warnings: warnings }
  } catch (err) {
    // log error and close browser.
    console.error(err)
    await browser.close()
  }
}
;(async () => {
  console.time('cscraper')
  try {
    await timetableScraper(2019)
  } catch (err) {
    console.log('something went wrong')
  }
  console.timeEnd('cscraper')
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(
      `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    )
  }
})()

export { timetableScraper }
