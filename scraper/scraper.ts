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
  Term,
  ClassesByTerm,
  valueOf,
  ExtendedTerm,
  Status,
  Day,
  Career,
  classWarnings,
  warning,
} from './interfaces'
import { cloneDeep } from 'lodash'

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
): Promise<string[]> => {
  // Get all the required urls...
  const urls = await page.$$eval('.data', e => {
    let inner = e.map(f => f.innerHTML)
    return inner
  })

  // Extract urls from html
  // Remove duplicate urls using a set
  const urlSet: Set<TimetableUrl> = new Set([])
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
const getChunks = async (page: puppeteer.Page): Promise<PageData[]> => {
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
 * @param dateList: list of census dates to be formatted to utc time
 */
const formatDates = (dateList: string[]): Date[] => {
  return dateList.map(date => new Date(date + 'Z'))
}

/**
 * Reverses the day and month order of the date so that it can be
 * robustly formated into a Date object using the formatDates() method
 * @param date: Date whose day and month is to be reversed
 * @param delimiter: delimiter separating date fiels
 */
const reverseDayAndMonth = (date: string, delimiter: string): string => {
  const splitDate = date.split(delimiter)
  return [splitDate[1], splitDate[0], splitDate[2]].join(delimiter)
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
    { term: Term.Summer, census: '1/8' },
    { term: Term.T1, census: '3/17' },
    { term: Term.T2, census: '6/30' },
    { term: Term.T3, census: '10/13' },
    { term: Term.S1, census: '3/31' },
    { term: Term.S2, census: '8/18' },
  ]
): Term[] => {
  if (!course.censusDates || course.censusDates.length <= 0) {
    throw new Error('no census dates for course: ' + course.courseCode)
  }
  // For each of the census dates...add a term to the list
  const censusDates = formatDates(course.censusDates)
  const currentYear = new Date().getFullYear()

  // Add the current year to the date and convert it to a date
  // object so it can be easily parsed
  const refCensusDates = formatDates(
    reference.map(element => {
      return element.census + '/' + currentYear
    })
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
 * Finds the Term for a class. Term is defined in interfaces.ts
 * @param cls: Class to find the term for
 * @param reference: Refernce dates to find the term.
 * Format of each element: { term: Term, dates: { start: number[], length: number[] } }
 * start is an array of possible start dates and length is
 */
const classTermFinder = (
  cls: Class,
  reference = [
    {
      term: Term.Summer,
      dates: [{ start: 11, length: 3 }, { start: 12, length: 2 }],
    },
    {
      term: Term.T1,
      dates: [
        { start: 1, length: 2 },
        { start: 1, length: 3 },
        { start: 1, length: 4 },
        { start: 2, length: 1 },
        { start: 2, length: 3 },
        { start: 3, length: 1 },
      ],
    },
    {
      term: Term.T2,
      dates: [
        { start: 3, length: 2 },
        { start: 4, length: 2 },
        { start: 4, length: 3 },
        { start: 5, length: 1 },
        { start: 5, length: 3 },
        { start: 6, length: 1 },
        { start: 6, length: 3 },
        { start: 7, length: 1 },
        { start: 7, length: 2 },
        { start: 8, length: 1 },
      ],
    },
    {
      term: Term.T3,
      dates: [
        { start: 8, length: 2 },
        { start: 8, length: 3 },
        { start: 9, length: 1 },
        { start: 9, length: 2 },
        { start: 9, length: 3 },
        { start: 10, length: 1 },
        { start: 10, length: 2 },
      ],
    },
    {
      term: Term.S1,
      dates: [{ start: 2, length: 4 }],
    },
    { term: Term.S2, dates: [{ start: 7, length: 4 }] },
  ]
): Term => {
  // Error check
  if (!(cls && cls.termDates)) {
    throw new Error('no start and end dates for class: ' + cls)
  }

  const [start, end] = formatDates(
    [cls.termDates.start, cls.termDates.end].map(date =>
      reverseDayAndMonth(date, '/')
    )
  )

  for (const termData of reference) {
    // A term could have any number of start dates
    for (const termDate of termData.dates) {
      // If start date and length match, then term is found
      if (
        start.getMonth() + 1 === termDate.start &&
        end.getMonth() -
          start.getMonth() +
          (end.getFullYear() - start.getFullYear()) * 12 ===
          termDate.length
      ) {
        return termData.term
      }
    }
  }

  throw new Error('Could not find term for class: ' + cls)
}

/**
 * Gets the data from the title of the course (course code, name)
 * @param page: page which displays the data to scrape
 */
const getCourseHeadData = async (page: puppeteer.Page): Promise<CourseHead> => {
  // Get the course code and course name
  const courseHead = await page.evaluate(() => {
    const courseHeader = document.getElementsByClassName(
      'classSearchMinorHeading'
    )[0].innerHTML
    const headerRegex = /(^[A-Z]{4}[0-9]{4})(.*)/
    return headerRegex.exec(courseHeader)
  })
  // There must be at least 3 elements in courseHead
  if (!courseHead && courseHead.length > 2) {
    throw new Error('Malformed course header: ' + courseHead)
  }
  const courseData: CourseHead = {
    courseCode: courseHead[1].trim(),
    name: removeHtmlSpecials(courseHead[2].trim()),
  }
  return courseData
}

/**
 * Scrapes all information, given a data array from a chunk that contains
 * course information for one course
 * @param data: Data array that contains the course information
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

  const courseData: CourseInfo = {
    school: school,
    campus: campus,
    career: career,
    termsOffered: termsOffered,
    censusDates: censusDates,
  }

  return { notes: notes, courseInfo: courseData }
}

/**
 * Parses data from the data array into a class object
 * @param data: array of text from elements with a data class
 * from a class chunk
 */
const parseClassChunk = (
  data: Chunk
): { classData: Class; warnings: classWarnings[] } | false => {
  let index = 0
  const warnings: classWarnings[] = []

  // ClassID is a 4 or 5 digit number
  const classID = parseInt(data[index])
  const classIDChecker = /^[0-9]{4,5}$/
  if (!classIDChecker.test(data[index])) {
    throw new Error('Invalid Class Id: ' + classID)
  }
  index++

  // Section is an 4 character alphanumeric code
  const section = data[index]
  const sectionChecker = /^[A-Z0-9]{0,4}$/
  if (!sectionChecker.test(section)) {
    throw new Error('Invalid Section: ' + section)
  }
  index++

  let term: string
  const termFinderRegex = /^([A-Z][A-Z0-9][A-Z0-9]?).*/
  if (termFinderRegex.test(data[index])) {
    term = termFinderRegex.exec(data[index])[1]
  }
  index++

  // Check if the class is actually course enrolment
  // which is not needed
  const courseEnrolmentChecker = /[Cc]ourse [Ee]nrolment/
  if (courseEnrolmentChecker.test(data[index])) {
    // Abort
    return false
  }

  const activity = data[index]
  if (!activity) {
    throw new Error('Unknown activity: ' + activity)
  }
  index++

  const status: Status = <Status>data[index]
  if (!Object.values(Status).includes(status)) {
    throw new Error('Invalid Status: ' + status)
  }
  index++

  const enrAndCap = data[index].split('/')
  const courseEnrolment = {
    enrolments: parseInt(enrAndCap[0]),
    capacity: parseInt(enrAndCap[1]),
  }
  // Enrolments and capacity are both numbers and enrolment less than capacity
  // (Strict requirement)
  if (
    !courseEnrolment ||
    !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity > 0) ||
    courseEnrolment.enrolments > courseEnrolment.capacity
  ) {
    // Lax requirement
    if (
      !courseEnrolment ||
      !(courseEnrolment.enrolments >= 0 && courseEnrolment.capacity >= 0)
    ) {
      throw new Error(
        'Invalid Course Enrolment: ' +
          courseEnrolment.enrolments +
          ' ' +
          courseEnrolment.capacity
      )
    } else {
      // Add warning
      const warning: classWarnings = {
        classID: classID,
        term: term,
        errKey: 'courseEnrolment',
        errValue: courseEnrolment,
      }
      warnings.push(warning)
    }
  }
  index++

  // Start and end dates can be used to classify each term code
  const runDates = data[index].split(' - ')
  if (!runDates || runDates.length === 0) {
    throw new Error('Could not find start and end dates in: ' + runDates)
  }
  const termDates = {
    start: runDates[0],
    end: runDates[1],
  }
  // Checking the format of the dates
  const dateCheckerRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/
  if (
    !(
      dateCheckerRegex.test(termDates.start) &&
      dateCheckerRegex.test(termDates.end)
    )
  ) {
    throw new Error('Invalid Date(s): ' + termDates)
  }
  index++

  // Skip meeting and census dates
  index += 2

  // class mode
  const mode = data[index]
  if (!mode || mode === ' ') {
    throw new Error('Invalid Mode: ' + mode)
  }
  index++

  // Skip consent
  index++

  // Any notes for the class (found later with dates)
  let notes: string
  // Dates
  const dateList: Time[] = []
  while (index < data.length) {
    // Check if there are any dates
    const dayCheckRegex = /^[A-Z][a-z]{2}$/
    if (!dayCheckRegex.test(data[index])) {
      // Add data as notes field and end checking
      notes = data[index]
      break
    }

    // Otherwise parse the date data
    // Day
    const day: Day = <Day>data[index]
    if (!(day && Object.values(Day).includes(day))) {
      throw new Error('Invalid day: ' + day)
    }
    index++

    // Start and end times
    const times = data[index].split(' - ')
    if (!times || times.length === 0) {
      throw new Error('Could not find start and end times in: ' + times)
    }
    const time = { start: times[0], end: times[1] }
    // Checking the format of the dates
    const timeCheckerRegex = /^[0-9]{2}:[0-9]{2}$/
    if (
      !(timeCheckerRegex.test(time.start) && timeCheckerRegex.test(time.end))
    ) {
      throw new Error('Invalid Time(s): ' + time)
    }
    index++

    // location
    let location: string | false = removeHtmlSpecials(data[index])
    // Check if location exists
    const locationTesterRegex = /[A-Za-z]/
    if (!(location && locationTesterRegex.test(location))) {
      // Add to warnings
      const warning: classWarnings = {
        classID: classID,
        term: term,
        errKey: 'location',
        errValue: location,
      }

      warnings.push(warning)

      // Remove location.
      location = false
    }
    index++

    // weeks
    const weeks = data[index]
    // Weeks is an alphanumeric string consisting of numbers, - and ,
    // (Strict requirement)
    let weeksTesterRegex = /^[0-9, <>-]+$/
    if (!weeksTesterRegex.test(weeks)) {
      weeksTesterRegex = /^[0-9A-Z, <>-]+$/
      if (!weeksTesterRegex.test(weeks)) {
        throw new Error('Invalid Weeks data: ' + weeks)
      } else {
        // Just warn.
        const warning: classWarnings = {
          classID: classID,
          term: term,
          errKey: 'weeks',
          errValue: weeks,
        }
        warnings.push(warning)
      }
    }
    index++

    // Extra newline
    index++

    const timeData: Time = { day: day, time: time, weeks: weeks }
    if (location) {
      timeData.location = location
    }
    dateList.push(timeData)
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

  return { classData: classData, warnings: warnings }
}

/**
 * Function scrapes all the course data on the given page
 * Returns an array of courses on the page
 * @param page Page to be scraped
 */
const scrapePage = async (
  page: puppeteer.Page
): Promise<{ coursesData: TimetableData; warnings: warning[] }> => {
  const coursesData: TimetableData = {
    Summer: [],
    T1: [],
    T2: [],
    T3: [],
    S1: [],
    S2: [],
    Other: [],
  }
  const warnings: warning[] = []
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
      let classWarns: classWarnings[] = []
      // There must be a course info array for any page
      if (!course.course_info) {
        throw new Error('Malformed page: ' + page.url())
      } else {
        const parsedInfo = parseCourseInfoChunk(course.course_info)
        notes = parsedInfo.notes
        course_info = parsedInfo.courseInfo
      }

      // There may or may not be a classlist
      if (course.classes) {
        for (const courseClass of course.classes) {
          const parsedClassChunk = parseClassChunk(courseClass)
          if (parsedClassChunk) {
            classes[classTermFinder(parsedClassChunk.classData)].push(
              parsedClassChunk.classData
            )

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
        const courseWarning: warning = {
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
  return { coursesData: coursesData, warnings: warnings }
}

/**
 * Returns a list of keys for an object
 * @param obj: Object to return a list of keys for
 */
const keysOf = <T extends {}>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[]

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

export { timetableScraper }
