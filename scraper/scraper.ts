import * as puppeteer from 'puppeteer';

// Remove any html character entities from the given string
// At this point, it only looks for 3 of them as more are not necessary
const removeHtmlSpecials = string => {
  // &amp --> and
  let newstr = string.replace('&amp;', 'and');

  // &nbsp ---> nothing (as it appears in course enrolment when the course does not have one)
  newstr = newstr.replace('&nbsp;', '');

  // &lt --> < (less than), this could be changed to before??
  newstr = newstr.replace('&lt;', '<');

  // There was no greater than sign found, but if neccessary, can be added here

  return newstr;
};

// Gets all the class data
const getClassData = async (data, rowStartIndex) => {
  try {
    // Store data for each class
    const classData = {};
    // term number to append class to
    let term = 0;

    // First 4 are similar in format and are:
    // class id, section id, term, activity(lecture/tutorial)
    let fields = ['classID', 'section', 'term', 'activity'];
    for (let field of fields) {
      // Store the term number to later append to the correct term
      if (field === 'term') {
        if (data[rowStartIndex].charAt(0) === 'U') {
          term = 0;
        } else {
          term = parseInt(data[rowStartIndex].charAt(1));
        }
      }
      if (
        field === 'activity' &&
        data[rowStartIndex].includes('Course Enrolment')
      ) {
        // Abort if you are looking at course enrolment
        return [[], rowStartIndex + 9, -1];
      }
      classData[field] = data[rowStartIndex];
      rowStartIndex++;
    }

    // Get the status of the class
    let regex = />([^\<]+)</;
    let result = regex.exec(data[rowStartIndex]);
    classData['status'] = result[1];
    rowStartIndex++;

    //class enrollments.
    const enrAndCap = data[rowStartIndex].split('/');
    classData['courseEnrolment'] = {
      enrolments: enrAndCap[0],
      capacity: enrAndCap[1]
    };
    rowStartIndex++;

    // Start and end dates, meeting dates, census date -> not needed
    rowStartIndex += 3;

    // Instruction mode:
    classData['mode'] = data[rowStartIndex];
    rowStartIndex++;

    // Skip consent
    rowStartIndex++;

    // Dates and location!
    const dateList = [];
    while (
      data[rowStartIndex] &&
      !data[rowStartIndex].includes('Back to top')
    ) {
      // Day
      const dateData = {};
      dateData['day'] = data[rowStartIndex];
      rowStartIndex++;

      // Start and end times
      const times = data[rowStartIndex].split(' - ');
      dateData['time'] = { start: times[0], end: times[1] };
      rowStartIndex++;

      // Checking the start and end times for errors
      // Existence
      if (!(times[0] && times[1])) {
        continue;
      }

      // if there are formatting issues, then skip!
      let checker = /^[0-9:]+$/;
      if (!(checker.test(times[0]) && checker.test(times[1]))) {
        continue;
      }

      // location
      dateData['location'] = removeHtmlSpecials(data[rowStartIndex]);
      rowStartIndex++;

      // weeks
      dateData['weeks'] = data[rowStartIndex];
      rowStartIndex++;

      // Extra newline
      rowStartIndex++;

      dateList.push(dateData);
    }

    classData['times'] = dateList;

    // Any notes
    // Find the index (cause the end is messed up)
    // So go back till the data line starts with an html element (or <)
    let notesIndex = rowStartIndex;
    while (data[notesIndex - 1].charAt(0) === '<') {
      notesIndex--;
    }

    // If the found line matches the regex, add a notes field
    let notesRegex = /^\<font *color *= *\"red\" *\>(.*)\<\/ *font *\>/;
    if (data[notesIndex] !== '' && notesRegex.test(data[notesIndex])) {
      const result = notesRegex.exec(data[notesIndex]);
      classData['notes'] = result[1];
    }

    // Return the scraped class along with updated row index and the term to add
    // the class to.
    return [classData, rowStartIndex + 1, term];
  } catch (err) {
    throw new Error(err);
  }
};

// Gets all the urls in the data class on page: page,
// given regex: regex.
// Each url will have the prefix: base.
const getDataUrls = async (page, base, regex) => {
  // Get all the required urls...
  const urls = await page.$$eval('.data', e => {
    let inner = e.map(f => f.innerHTML);
    return inner;
  });

  // Extract urls from html
  // Remove duplicate urls using a set
  const urlSet = new Set([]);
  const myRe = /href="(.*)">/;
  urls.forEach(element => {
    const link = element.match(myRe);
    if (link !== null && link.length > 0) {
      if (regex.test(link[1])) {
        const url = base + link[1];
        urlSet.add(url);
      }
    }
  });

  return Array.from(urlSet);
};

const scrapePage = async page => {
  // Stores data for every course on a page.
  const coursesData = [];
  let rowStartIndex = 0;
  // Get all the data elements.
  const data = await page.$$eval('.data', element =>
    element.map(e => e.innerHTML)
  );

  // Scrape all courses on the page
  while (rowStartIndex < data.length - 2) {
    // Objects that stores all the data for a single course
    const courseData = {};

    // Get the course code and course name
    const courseHead = await page.evaluate(() => {
      let courseHeader = document.getElementsByClassName(
        'classSearchMinorHeading'
      )[0].innerHTML;
      let regexp = /(^[A-Z]{4}[0-9]{4})(.*)/;
      return regexp.exec(courseHeader);
    });
    courseData['courseCode'] = courseHead[1].trim();
    courseData['name'] = removeHtmlSpecials(courseHead[2].trim());

    // Getting the course type (undergrad/postgrad)
    while (
      data[rowStartIndex] !== 'Undergraduate' &&
      data[rowStartIndex] !== 'Postgraduate' &&
      data[rowStartIndex] !== 'Research'
    ) {
      rowStartIndex++;
    }

    // Once the index has been reached, get the career path
    if (data[rowStartIndex].trim() === 'Undergraduate') {
      courseData['career'] = 0;
    } else if (data[rowStartIndex].trim() === 'Postgraduate') {
      courseData['career'] = 1;
    } else {
      // Research
      courseData['career'] = 2;
    }

    // List of terms the course is offered in
    const termlist = [];

    // Getting the course enrolment.
    for (let i = rowStartIndex; i < data.length; i++) {
      // Getting all the terms that the course is offered in
      if (/^U.{1,4}[ABC]?$/.test(data[i]) && !termlist.includes('U1')) {
        termlist.push('U1');
      } else if (
        /^T[1-3][ABC]?$/.test(data[i]) &&
        !termlist.includes('T' + data[i].charAt(1))
      ) {
        termlist.push('T' + data[i].charAt(1));
      }
      if (data[i].includes('Course Enrolment')) {
        rowStartIndex = i;
        break;
      }
    }
    courseData['termsOffered'] = termlist;
    courseData['courseEnrolment'] = data[rowStartIndex + 5];

    // Go to the index where term 1 records start.
    rowStartIndex += 7;

    // Get class list
    const classList = [];
    const summer = [];
    const term1 = [];
    const term2 = [];
    const term3 = [];

    // Skip till we reach 4 or 5 digit number on a line
    // Which means we reached class info area.
    while (!/^[0-9]{4,5}$/.test(data[rowStartIndex])) {
      // If we reach the last line on the page, then the course
      // has no classes.
      if (data[rowStartIndex].includes('Back to top')) {
        courseData['classes'] = [];
        return [courseData]; // returned value is an array
      }
      rowStartIndex++;
    }

    // Scrape all classes
    while (data[rowStartIndex] && rowStartIndex < data.length - 2) {
      // Fix any alignment issues.
      while (
        rowStartIndex < data.length &&
        !/^[0-9]{4,5}$/.test(data[rowStartIndex])
      ) {
        rowStartIndex++;
      }

      // If we have reached the end, skip!
      if (rowStartIndex >= data.length) {
        break;
      }

      // Get information about one class
      const classData = await getClassData(data, rowStartIndex);

      // Depending on the term, append to respective list.
      if (classData[2] === 0) {
        summer.push(classData[0]);
      } else if (classData[2] === 1) {
        term1.push(classData[0]);
      } else if (classData[2] === 2) {
        term2.push(classData[0]);
      } else if (classData[2] === 3) {
        term3.push(classData[0]);
      }

      // Update the index to scrape from
      rowStartIndex = classData[1];

      // Special case -> no classes lead to end of page
      if (!data[rowStartIndex]) {
        break;
      }

      // Special case -> end of data/page has both undergrad
      // and postgrad details...
      // or page ended (two back to tops signal this.)
      if (data[rowStartIndex].includes('Back to top')) {
        if (
          data[rowStartIndex - 1] &&
          data[rowStartIndex - 1].includes('Back to top')
        ) {
          break;
        }
        if (
          data[rowStartIndex + 1] &&
          data[rowStartIndex + 1].includes('Back to top')
        ) {
          // Alignment
          rowStartIndex++;
          break;
        }
      }
    }

    classList.push(summer);
    classList.push(term1);
    classList.push(term2);
    classList.push(term3);

    courseData['classes'] = classList;
    coursesData.push(courseData);
  }
  return coursesData;
};

// Creates browser pages to then use to scrape
const createPages = async (browser, batchsize) => {
  // List of pages
  const pages = [];
  for (let pageno = 0; pageno < batchsize; pageno++) {
    let singlepage = await browser.newPage();
    // Block all js, css, fonts and images for speed
    await singlepage.setRequestInterception(true);
    singlepage.on('request', request => {
      const type = request.resourceType();
      if (
        type === 'script' ||
        type === 'stylesheet' ||
        type === 'font' ||
        type === 'image'
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
    pages.push(singlepage);
  }
  return pages;
};

// Async wrapper to scrape multiple subjects at once
// This scrapes one subject
const scrapeSubject = async (page, course) => {
  try {
    await page.goto(course, {
      waitUntil: 'networkidle2'
    });

    // Get all relevant data for one page
    return await scrapePage(page);
  } catch (err) {
    // console.log(course);
    throw new Error(err);
  }
};

const getPageUrls = async (url, page, base, regex) => {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2'
    });

    // Then, get each data url on that page
    return await getDataUrls(page, base, regex);
  } catch (err) {
    // console.log(url);
    throw new Error(err);
  }
};

const timetableScraper = async () => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch();
  try {
    const batchsize = 50;
    // Create batchsize pages to scrape each course
    const pages = await createPages(browser, batchsize);
    let page = pages[0];

    // If the scraper is automated, the year should be dynamically
    // generated to access the respective timetable page
    const year = new Date().getFullYear();

    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // JSON Array to store the course data.
    const timetableData = [];

    // Go to the page with list of subjects (Accounting, Computers etc)
    await page.goto(base, {
      waitUntil: 'networkidle2'
    });

    // Defining the regex for course scraping...
    let regex = /([A-Z]{8})\.html/;

    // Gets all the dataurls on the timetable page.
    const urlList = await getDataUrls(page, base, regex);

    // Defining the regex for each of the subject codes...
    regex = /([A-Z]{4}[0-9]{4})\.html/;

    // List of promises that are being resolved
    let promises = [];

    // array of resolved promises from the promises array
    let result = [];

    // Jobs -> urls of each subject
    let jobs = [];

    // Scrape all the urls from the subject pages (eg: COMPKENS, etc)
    for (let url = 0; url < urlList.length; ) {
      promises = [];
      result = [];

      // Open a different url on a different page
      for (let i = 0; i < batchsize && url < urlList.length; i++) {
        const urls = getPageUrls(urlList[url], pages[i], base, regex);
        promises.push(urls);
        url++;
      }
      // Wait for all the pages
      result = await Promise.all(promises);

      // Then add them to the jobs queue
      for (let pageurls of result) {
        jobs = jobs.concat(pageurls);
      }
    }

    // Now scrape each page in the jobs queue and then add it to the scraped
    // array
    for (let job = 0; job < jobs.length; ) {
      promises = [];
      result = [];
      for (let i = 0; i < batchsize && job < jobs.length; i++) {
        const data = scrapeSubject(pages[i], jobs[job]);
        promises.push(data);
        job++;
      }
      // Wait for all the pages
      result = await Promise.all(promises);

      for (let element of result) {
        // Each element may contain multiple courses
        for (let scrapedCourse of element) {
          timetableData.push(scrapedCourse);
        }
      }
    }

    // Close the browser.
    await browser.close();

    // Return the data that was scraped
    return JSON.stringify(timetableData);
  } catch (err) {
    // log error and close browser.
    console.error(err);
    await browser.close();

    // Since there was an error, return empty object
    return [];
  }
};

export { timetableScraper };
