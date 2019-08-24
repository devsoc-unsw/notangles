import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { threadId } from 'worker_threads';
import { EROFS } from 'constants';

// import * as .. does not work for chalk, so require.
const chalk = require('chalk');

// Gets all the class data
const getClassData = async (data, rowStartIndex) => {
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
      term = parseInt(data[rowStartIndex].charAt(1));
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
  while (data[rowStartIndex] && !data[rowStartIndex].includes('Back to top')) {
    // Day
    const dateData = {};
    dateData['day'] = data[rowStartIndex];
    rowStartIndex++;

    // Start and end times
    const times = data[rowStartIndex].split(' - ');
    dateData['time'] = { start: times[0], end: times[1] };
    rowStartIndex++;

    // location
    dateData['location'] = data[rowStartIndex];
    rowStartIndex++;

    // weeks
    dateData['weeks'] = data[rowStartIndex];
    rowStartIndex++;

    // Extra newline
    rowStartIndex++;

    dateList.push(dateData);
  }

  classData['times'] = dateList;

  // console.log(classData);
  // console.log(data[rowStartIndex]);
  // console.log(data[rowStartIndex + 1]);
  // console.log(term);

  // // Final field -> list of times.
  // const datelist = (data[rowStartIndex].split(',')).map(element => element.trim());
  // for (let date of datelist)
  // {
  //   const timeData = {};
  //   const tokens = date.split(' ');
  //   timeData['day'] = tokens[0];
  //   timeData['time'] = { 'start': tokens[1], 'end': tokens[2] }
  //   const weeks = tokens[3].split('(:)');
  //   console.log(weeks);
  //   timeData['weeks'] = weeks[2];     // Possibly split this.
  //   timeData['location']
  // }

  return [classData, rowStartIndex + 1, term];
};

// Gets all the urls in the data class on page: page,
// given regex: regex.
// Each url will have the prefix: base.
const getDataUrls = async (page, base, regex) => {
  // Get all the required urls...
  const urls = await page.$$eval('.data', e => {
    let inner = e.map(f => f.innerHTML);

    // console.log(inner);
    return inner;
  });

  // Extract urls from html
  // Remove duplicate urls using a set
  const urlSet = new Set([]);
  let count = 0;
  const myRe = /href="(.*)">/;
  // console.log(urls);
  urls.forEach(element => {
    const link = element.match(myRe);
    count++;
    if (link !== null && link.length > 0) {
      // console.log(link[1]);
      if (regex.test(link[1])) {
        const url = base + link[1];
        urlSet.add(url);
      }
    }
  });

  return urlSet;
};

const scrapePage = async page => {
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
  courseData['name'] = courseHead[2].trim();

  // Get all the data elements.
  const data = await page.$$eval('.data', element =>
    element.map(e => e.innerHTML)
  );

  // Getting the course type (undergrad/postgrad)
  const careerIndex = 6; // I wonder if i should use a loop instead... (but the page is static...)
  if (data[careerIndex].trim() === 'Undergraduate') {
    courseData['isPostgrad'] = false;
  } else {
    courseData['isPostgrad'] = true;
  }

  // Getting the course enrolment. (What is this???)
  let rowStartIndex = 0;
  for (let i in data) {
    if (data[i].includes('Course Enrolment')) {
      rowStartIndex = parseInt(i);
      break;
    }
  }
  courseData['courseEnrolment'] = data[rowStartIndex + 5];
  // Go to the index where term 1 records start.
  rowStartIndex += 7;
  // console.log(data);
  // console.log(rowStartIndex, data[rowStartIndex]);

  // Get class list
  const classList = [];
  const term1 = [];
  const term2 = [];
  const term3 = [];

  // while (
  //   // data[rowStartIndex] &&
  //   // !data[rowStartIndex].includes('TERM ONE') &&
  //   rowStartIndex <
  //   data.length - 3000
  // ) {
  //   console.log(data[rowStartIndex]);
  //   rowStartIndex++;
  // }

  // throw new Error();

  // Skip till we reach 4 digit number on a line
  // Which means we reached class info area.
  while (!/^[0-9]{4}$/.test(data[rowStartIndex])) {
    rowStartIndex++;
  }
  // for (let x = rowStartIndex; x < data.length; x++) {
  //   console.log(data[x]);
  // }
  // throw new Error('testing...');

  // Scrape all the class data
  while (data[rowStartIndex] && rowStartIndex < data.length - 1) {
    const classData = await getClassData(data, rowStartIndex);
    // console.log(classData);

    // Depending on the term, append to respective list.
    // console.log('Term no --------------------> ', classData[2]);
    if (classData[2] === 1) {
      term1.push(classData[0]);
    } else if (classData[2] === 2) {
      term2.push(classData[0]);
    } else if (classData[2] === 3) {
      term3.push(classData[0]);
    }

    // Update the index to scrape from
    rowStartIndex = classData[1];

    // If this is at a term boundary, then move row index
    if (data[rowStartIndex].includes('name="S')) {
      rowStartIndex++;
    }
  }

  classList.push(term1);
  classList.push(term2);
  classList.push(term3);

  courseData['classes'] = classList;
  // for (let i = data.length - 1; i >= data.length - 50; i--) {
  //   if (data[i]) {
  //     console.log(data[i]);
  //   }
  // }
  return courseData;
};

const error = chalk.bold.red;
const success = chalk.green;
(async () => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch();
  try {
    let page = await browser.newPage();

    // If the scraper is automated, the year should be dynamically
    // generated to access the respective timetable page
    const year = new Date().getFullYear();

    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // Go to the page with list of subjects (Accounting, Computers etc)
    await page.goto(base, {
      waitUntil: 'networkidle2'
    });

    // Defining the regex for course scraping...
    let regex = /([A-Z]{8})\.html/;

    // Gets all the dataurls on the timetable page.
    const urlSet = await getDataUrls(page, base, regex);

    // Store all the urls of all the subjects on all the pages. (as set of sets)
    // (possibly change this later so that only urls on a single page are stored)
    let courses;

    // Defining the regex for each of the subject codes...
    regex = /([A-Z]{4}[0-9]{4})\.html/;

    // Counter variable for debugging
    let i = 0;

    // Go to each page, and get all the subject urls
    for (const url of urlSet) {
      // Follow each link...
      //const page2 = await browser.newPage();
      try {
        // console.log('opening ' + url);
        await page.goto(url, {
          waitUntil: 'networkidle2'
        });

        // Then, get each data url on that page
        courses = await getDataUrls(page, base, regex);

        // Open each subject url and print data!!
        for (const course of courses) {
          await page.goto(course, {
            waitUntil: 'networkidle2'
          });

          const courseData = await scrapePage(page);
          console.log(courseData);
          // i++;

          // if (i == 2) {
          //   break;
          // }
        }
      } catch (err) {
        console.log(err);
      }
    }

    // console.log(courses);
    // Close the browser.
    await browser.close();
    console.log(success('Browser closed'));
  } catch (err) {
    // log error and close browser.
    console.log(error(err));
    await browser.close();
    console.log(error('Browser closed'));
  }
})();

// from previous deleted branch
// import * as puppeteer from 'pupeteer';

// // import * as .. does not work for chalk, so require.
// const chalk = require('chalk');

// const error = chalk.bold.red;
// const success = chalk.green;
// (async () => {
//   // Launch the browser. Headless mode = true by default
//   // On cse machines, instead use:
//   const browser = await puppeteer.launch({
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
//   });
//   //const browser = await puppeteer.launch();
//   try {
//     let page = await browser.newPage();

//     // Go to the timetable page
//     await page.goto('http://timetable.unsw.edu.au/2019/subjectSearch.html', {
//       waitUntil: 'networkidle2'
//     });

//     // Scrape a single page.
//     // Find all links to articles
//     const postsSelector = '.main .article h2 a';
//     await page.waitForSelector(postsSelector, { timeout: 0 });
//     const postUrls = await page.$$eval(postsSelector, postLinks => postLinks.map(link => link.href));

//     // Visit each page one by one
//     for (let postUrl of postUrls) {
//         // open the page
//         try {
//             await page.goto(postUrl);
//             console.log('opened the page: ', postUrl);
//         } catch (error) {
//             console.log(error);
//             console.log('failed to open the page: ', postUrl);
//         }

//         // get the pathname
//         let pagePathname = await page.evaluate(() => location.pathname);
//         pagePathname = pagePathname.replace(/\//g, "-");
//         console.log('got the pathname:', pagePathname);

//         // get the title of the post
//         const titleSelector = '.article h1';
//         await page.waitForSelector(titleSelector);
//         const pageTitle = await page.$eval(titleSelector, titleSelector => titleSelector.outerHTML);
//         console.log('found the title', pageTitle);

//         // get the content of the page
//         const contentSelector = '.article .entry-content';
//         await page.waitForSelector(contentSelector, { timeout: 0 });
//         const pageContent = await page.$eval(contentSelector, contentSelector => contentSelector.innerHTML);
//         console.log('found the content: ', pageContent);

//     }

//     // Close the browser.
//     await browser.close();
//     console.log(success('Browser closed'));
//   } catch (err) {
//     // log error and close browser.
//     console.log(error(err));
//     await browser.close();
//     console.log(error('Browser closed'));
//   }
// })();
