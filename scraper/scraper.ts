import * as puppeteer from 'puppeteer'
import { cloneDeep } from 'lodash'

import { TimetableData, UrlList, ExtendedTerm, Warning } from './interfaces'
import { getUrls, getUrlsParams, scrapePage, termFinder } from './PageScraper'
import { keysOf, createPages } from './helper'

interface ScrapeSubjectParams {
  page: puppeteer.Page
  course: string
}

/**
 * Async wrapper to scrape multiple subjects at once
 * This scrapes one subject
 * @param { puppeteer.Page } page Page to use to scrape the subject
 * @param { string } course Url of the course to be scraped
 * @returns {Promise<{ courseData: TimetableData; warnings: Warning[] }}: The data that has been scraped, classified into one of 6 terms. If the scraper is unable to classify courses, then it will group them under 'Other'
 * @example
 *    const browser = await puppeteer.launch()
 *    const data = scrapeSubject(await browser.newPage(), 'http://timetable.unsw.edu.au/2019/COMP1511.html')
 */
const scrapeSubject = async ({
  page,
  course,
}: ScrapeSubjectParams): Promise<{
  coursesData: TimetableData
  warnings: Warning[]
}> => {
  await page.goto(course, {
    waitUntil: 'networkidle2',
  })

  // Get all relevant data for one page
  return await scrapePage(page)
}

interface getPageUrlsParams extends getUrlsParams {
  url: string
}

/**
 * Gets all the urls on the current page matching the given regex
 * (This function is only an async puppeteer wrapper)
 * @param { string } url Url of the page to scrape
 * @param { puppeteer.Page } page page to be used for scraping
 * @param { string } base prefix for each scraped url
 * @param { RegExp } regex regex to check each scraped url
 * @returns { Promise<string[]> } List of all urls on @param page . Each url is prefixed by @param base
 * @example
 *    const browser = await puppeteer.launch()
 *    const urls = getPageUrls('http://timetable.unsw.edu.au/2019/COMP1511.html', await browser.newPage(), 'http://timetable.unsw.edu.au/2019/', /html$/)
 * Expect: [ '.*html' ]*
 */
const getPageUrls = async ({
  url,
  page,
  regex,
}: getPageUrlsParams): Promise<string[]> => {
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  // Then, get each data url on that page
  const getDataUrlsParams: getUrlsParams = {
    page: page,
    regex: regex,
  }
  return await getUrls(getDataUrlsParams)
}

/**
 * The scraper that scrapes the timetable site
 * @param { number } year: The year for which the information is to be scraped
 * @returns { Promise<{ timetableData: TimetableData; warnings: Warning[] } }: The data that has been scraped, grouped into one of 6 terms. If the scraper is unable to classify courses, then it will group them under 'Other'
 * @returns { false }: Scraping failed due to some error. Error printed to console.error
 * @example
 * 1.
 *    const data = await timetableScraper(2020)
 *    console.log(data.timetableData.T1) // Expect list of T1 courses in 2020
 * 2.
 *    const data = await timetableScraper(40100)
 *    console.log(data) // false
 */
const timetableScraper = async (
    year: number
  ): Promise<{ timetableData: TimetableData; warnings: Warning[] } | false> => {
    // Launch the browser. Headless mode = true by default
    const browser = await puppeteer.launch({ headless: false })
    try {
      const batchsize = 50
      // Create batchsize pages to scrape each course
      const pages = await createPages({
        browser: browser,
        batchsize: batchsize,
      })
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
      const warnings: Warning[] = []

      // Go to the page with list of subjects (Accounting, Computers etc)
      await page.goto(base, {
        waitUntil: 'networkidle2',
      })

      // Defining the regex for course scraping...
      const courseUrlRegex = /([A-Z]{8})\.html/

      // Gets all the dataurls on the timetable page.
      const urlList = await getUrls({
        page: page,
        regex: courseUrlRegex,
      })

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
          const urls = getPageUrls({
            url: urlList[url],
            page: pages[i],
            regex: subjectUrlRegex,
          })
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
          warnings: Warning[]
        }>[] = []
        let result: { coursesData: TimetableData; warnings: Warning[] }[]
        for (let i = 0; i < batchsize && job < jobs.length; i++) {
          const data = scrapeSubject({
            page: pages[i],
            course: jobs[job],
          })
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
                const termlist = termFinder({ course: scrapedCourse })
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
      return false
    }
  }

  // This function is for devlopment purposes only. Use npm run scraper to test the scraper
;(async () => {
  console.time('cscraper')
  try {
    // const data = await timetableScraper(2019)

    // if (data === false) {
    //   return
    // }

    // const fs = require('fs')
    // fs.writeFile(
    //   'T1.json',
    //   JSON.stringify(data.timetableData.T1),
    //   'utf-8',
    //   (err: unknown) => {
    //     if (err) {
    //       console.error(err)
    //     }
    //   }
    // )

    const browser = await puppeteer.launch({ headless: false })
    const singlepage = await browser.newPage()
    const data = await scrapeSubject({
      page: singlepage,
      course: 'http://timetable.unsw.edu.au/2019/COMP1511.html',
    })

    const fs = require('fs')
    fs.writeFile(
      'T1.json',
      JSON.stringify(data.coursesData.T1),
      'utf-8',
      (err: unknown) => {
        if (err) {
          console.error(err)
        }
      }
    )

    // await browser.close()
  } catch (err) {
    console.log(err)
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
