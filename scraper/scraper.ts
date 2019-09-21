import * as puppeteer from 'puppeteer'
import {
  Course,
  CourseHead,
  CourseInfo,
  Time,
  Class,
  Chunk,
  PageData,
  TimetableData,
  TimetableUrl,
  UrlList,
} from './interfaces'
/**
 * Remove any html character entities from the given string
 * At this point, it only looks for 3 of them as more are not necessary
 * @param string The string to remove html characters from
 */
const removeHtmlSpecials = (string: string) => {
  // &amp --> and
  let newstr = string.replace('&amp;', 'and')

  // &nbsp ---> nothing (as it appears in course enrolment when the course does not have one)
  newstr = newstr.replace('&nbsp;', '')

  // &lt --> < (less than), this could be changed to before??
  newstr = newstr.replace('&lt;', '<')

  // There was no greater than sign found, but if neccessary, can be added here

  return newstr
}

/**
 * Gets all the urls in the data class on page: page,
 * given regex: regex.
 * Each url will have the prefix: base.
 * @param page Page to scrape urls from
 * @param base base each url has to be prefixed with
 * @param regex regex to check each url
 */
const getDataUrls = async (
  page: puppeteer.Page,
  base: string,
  regex: RegExp
) => {
  // Get all the required urls...
  const urls = await page.$$eval('.data', e => {
    let inner = e.map(f => f.innerHTML)
    return inner
  })

  // Extract urls from html
  // Remove duplicate urls using a set
  const urlSet: Set<string> = new Set([])
  const myRe = /href="(.*)">/
  urls.forEach(element => {
    const link = element.match(myRe)
    if (link !== null && link.length > 0) {
      if (regex.test(link[1])) {
        const url = base + link[1]
        urlSet.add(url)
      }
    }
  })

  return Array.from(urlSet)
}

/**
 * Breaks the page down into relevant chunks from which data can be extracted
 * @param page: page to be broken down into chunks
 */
const getChunks = async (page: puppeteer.Page) => {
  const chunks: PageData[] = await page.evaluate(() => {
    const chunkList: HTMLElement[][] = []
    const courseTables: NodeListOf<HTMLElement> = document.querySelectorAll(
      '[class="formBody"][colspan="3"]'
    )
    for (const course of courseTables) {
      // Get every td which has more than 1 table
      const parts = Array.from(course.children).filter(
        (element: HTMLElement) => element.tagName === 'TABLE'
      ) as HTMLElement[]
      if (parts.length > 1) {
        chunkList.push(parts)
      }
    }

    // Data to be returned ----> list of course objects
    const coursesDataElements: PageData[] = []

    // Deciding...
    for (const course of chunkList) {
      let course_info: Chunk
      let classes: Chunk[]
      for (const chunk of course) {
        // If there are any data fields inside the chunk, then categorize it
        const data: HTMLElement = chunk.querySelector('.data')
        if (data) {
          // console.log('has data elements')
          const query: string = 'a[href="#top"]'
          const classlist: HTMLElement = chunk.querySelector(query)
          const note: HTMLElement = chunk.querySelector('.note')
          const subtables: NodeListOf<HTMLElement> = chunk.querySelectorAll(
            ':scope > tbody > tr > td > table'
          )

          // If the table has any element with id top, then it is the classes table.
          if (classlist) {
            // The table represents a classlist!! -> the split chunks are then each element of subtables...
            // get all elements with class data from each table and then return that array.
            const tablelist: Chunk[] = []
            for (const subtable of subtables) {
              tablelist.push(
                [...subtable.querySelectorAll<HTMLElement>('.data')].map(
                  element => element.innerText
                )
              )
            }
            if (!classes) {
              classes = tablelist
            } else {
              classes = classes.concat(tablelist)
            }
          } else if (note) {
            // The table is the summary table ---> skip!
          } else if (subtables.length === 3) {
            // This should be the course info table. --> get data elements
            course_info = [...chunk.querySelectorAll<HTMLElement>('.data')].map(
              element => element.innerText
            )
          }
          // Else -> other heading tables ---> skip!
        }
      }
      if (classes) {
        coursesDataElements.push({ course_info: course_info, classes: classes })
      } else {
        coursesDataElements.push({ course_info: course_info })
      }
    }
    return coursesDataElements
  })
  return chunks
}

/**
 * Converts dates into date objects
 * @param censusDateList: list of census dates to be formatted to utc time
 */
const formatCensusDates = (censusDateList: string[]) => {
  return censusDateList.map(date => new Date(date + 'Z'))
}

/**
 * Given some reference dates for the term,
 * the function returns one of the 6 terms that
 * the course can be a part of
 * [ Summer, T1, T2, T3, S1, S2 ]
 * @param course: course the term is required for
 * @param reference The reference is optional. The default is:
 * (Convert the dates into start (month of starting)
 * and length (number of months the course runs))
 * Summer: 26/11 ---> 10/02
 * T1: 18/02 ---> 19/05
 * T2: 03/06 ---> 01/09
 * T3: 16/09 ---> 15/12
 * S1: 25/02 ---> 30/06
 * S2: 15/07 ---> 10/11
 * The date format for reference census dates is month/day
 */
const termFinder = (
  course: Course,
  reference = [
    { term: 'Summer', start: 11, length: 2, census: '1/8' },
    { term: 'T1', start: 2, length: 3, census: '3/17' },
    { term: 'T2', start: 6, length: 3, census: '6/30' },
    { term: 'T3', start: 9, length: 3, census: '10/13' },
    { term: 'S1', start: 2, length: 4, census: '3/31' },
    { term: 'S2', start: 7, length: 4, census: '8/18' },
  ]
) => {
  if (!course.censusDates || course.censusDates.length <= 0) {
    throw new Error('no census dates for course: ' + course['courseCode'])
  }
  // For each of the census dates...add a term to the list
  const censusDates = formatCensusDates(course['censusDates'])
  const currentYear = new Date().getFullYear()

  // Add the current year to the date and convert it to a date
  // object so it can be easily parsed
  const refCensusDates = formatCensusDates(
    reference.map(element => {
      return element.census + '/' + currentYear
    })
  )

  const termList: string[] = []
  for (const censusDate of censusDates) {
    // minimum difference with the reference census date means the course is in that term
    let min = -1
    let index = 0
    let term: string
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
 * Gets the data from the title of the course (course code, name)
 * @param page: page which displays the data to scrape
 */
const getCourseHeadData = async (page: puppeteer.Page) => {
  const courseData = {} as CourseHead
  // Get the course code and course name
  const courseHead = await page.evaluate(() => {
    const courseHeader = document.getElementsByClassName(
      'classSearchMinorHeading'
    )[0].innerHTML
    const headerRegex = /(^[A-Z]{4}[0-9]{4})(.*)/
    return headerRegex.exec(courseHeader)
  })
  courseData.courseCode = parseInt(courseHead[1].trim())
  courseData.name = removeHtmlSpecials(courseHead[2].trim())
  return courseData
}

/**
 * Scrapes all information, given a data array from a chunk that contains
 * course information for one course
 * @param data: Data array that contains the course information
 */
const parseCourseInfoChunk = (data: Chunk) => {
  let index = 0

  // Faculty not needed
  index++

  // School
  const school = data[index]
  index++

  // Skip online handbook record
  index++

  // campus location
  const campus = data[index]
  index++

  // Career type
  const career = data[index]
  index++

  const termsOffered = []
  const censusDates = []
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
    }
    index++
  }
  const courseData: CourseInfo = {
    school: school,
    campus: campus,
    career: career,
    termsOffered: termsOffered,
    censusDates: censusDates,
  }
  return courseData
}

/**
 * Parses data from the data array into a class object
 * @param data: array of text from elements with a data class
 * from a class chunk
 */
const parseClassChunk = (data: Chunk) => {
  let index = 0

  const classID = data[index]
  index++

  const section = data[index]
  index++

  let term: string
  const termFinderRegex = /^[A-Z][A-Z0-9][A-Z0-9]?$/
  if (termFinderRegex.test(data[index])) {
    term = termFinderRegex.exec(data[index])[1]
  }
  index++

  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  if (courseEnrolmentChecker.test(data[index])) {
    // Abort
    return false
  }
  const activity = data[index]
  index++

  const status = data[index]
  index++

  const enrAndCap = data[index].split('/')
  const courseEnrolment = {
    enrolments: parseInt(enrAndCap[0]),
    capacity: parseInt(enrAndCap[1]),
  }
  index++

  // Start and end dates can be used to classify each term code
  const runDates = data[index].split(' - ')
  const termDates = {
    start: runDates[0],
    end: runDates[1],
  }
  index++

  // Skip meeting and census dates
  index += 2

  // class mode
  const mode = data[index]
  index++

  // Skip consent
  index++

  // Any notes for the class (found later with dates)
  let notes: string

  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Check if there are any dates
    const dayCheckRegex = /^[a-zA-Z]{3}$/
    if (!dayCheckRegex.test(data[index])) {
      // Add data as notes field and end checking
      notes = data[index]
      break
    }

    // Otherwise parse the date data
    // Day
    const day = data[index]
    index++

    // Start and end times
    const times = data[index].split(' - ')
    const time = { start: times[0], end: times[1] }
    index++

    // location
    const location = removeHtmlSpecials(data[index])
    index++

    // weeks
    const weeks = data[index]
    index++

    // Extra newline
    index++

    dateList.push({ day: day, time: time, location: location, weeks: weeks })
  }

  const classData: Class = {
    classID: classID,
    section: section,
    term: term,
    activity: activity,
    status: status,
    courseEnrolment: courseEnrolment,
    termDates: termDates,
    mode: mode,
    times: dateList,
  }

  if (notes) {
    classData.notes = notes
  }

  return classData
}

/**
 * Function scrapes all the course data on the given page
 * Returns an array of courses on the page
 * @param page Page to be scraped
 */
const scrapePage = async (page: puppeteer.Page) => {
  const coursesData: Course[] = []
  const pageChunks: PageData[] = await getChunks(page)
  // For each course chunk...
  for (const course of pageChunks) {
    // Get course code and name, that is not a chunk
    const courseHeadData = await getCourseHeadData(page)
    let course_info: CourseInfo
    const classes: Class[] = []
    // There must be a course info array for any page
    if (!course.course_info) {
      throw new Error('Malformed page: ' + page.url())
    } else {
      course_info = parseCourseInfoChunk(course.course_info)
    }

    // There may or may not be a classlist
    if (course.classes) {
      for (const courseClass of course.classes) {
        const classData = parseClassChunk(courseClass)
        if (classData) {
          classes.push(classData)
        }
      }
    }

    coursesData.push(
      Object.assign(courseHeadData, course_info, { classes: classes })
    )
  }
  return coursesData
}

/**
 * Creates browser pages to then use to scrape the website
 * @param browser: browser object (window) in which to create new pages
 * @param batchsize: Number of pages to be created
 */
const createPages = async (browser: puppeteer.Browser, batchsize: number) => {
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
const scrapeSubject = async (page: puppeteer.Page, course: string) => {
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
) => {
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  // Then, get each data url on that page
  return await getDataUrls(page, base, regex)
}

/**
 * The scraper that scrapes the timetable site
 */
const timetableScraper = async () => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch()
  try {
    const batchsize = 50
    // Create batchsize pages to scrape each course
    const pages = await createPages(browser, batchsize)
    let page = pages[0]

    // If the scraper is automated, the year should be dynamically
    // generated to access the respective timetable page
    const year = new Date().getFullYear()

    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`

    // JSON Array to store the course data.
    const timetableData: TimetableData = {
      Summer: [],
      T1: [],
      T2: [],
      T3: [],
      S1: [],
      S2: [],
    }

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
      const promises: Promise<Course[]>[] = []
      let result: Course[][]
      for (let i = 0; i < batchsize && job < jobs.length; i++) {
        const data = scrapeSubject(pages[i], jobs[job])
        promises.push(data)
        job++
      }
      // Wait for all the pages
      result = await Promise.all(promises)

      for (const element of result) {
        // Each element may contain multiple courses
        for (const scrapedCourse of element) {
          if (!scrapedCourse) {
            console.log(element, 'Error in result: ', result)
            throw new Error()
          }
          const termlist = termFinder(scrapedCourse)
          for (const term of termlist) {
            timetableData[term].push(Object.assign({}, scrapedCourse))
          }
        }
      }
    }
    // Close the browser.
    await browser.close()

    // Return the data that was scraped
    return JSON.stringify(timetableData)
  } catch (err) {
    // log error and close browser.
    console.error(err)
    await browser.close()

    // Since there was an error, return empty object
    return []
  }
}

export { timetableScraper }
