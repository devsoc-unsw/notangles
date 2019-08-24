import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

// import * as .. does not work for chalk, so require.
const chalk = require('chalk');

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
  let check = false;
  for (let i in data) {
    if (data[i].includes('Course Enrolment')) {
      rowStartIndex = parseInt(i);
      break;
    }
  }
  courseData['courseEnrolment'] = data[rowStartIndex + 5];
  // Go to the index where term 1 records start.
  rowStartIndex += 7;
  console.log(data);
  console.log(rowStartIndex, data[rowStartIndex]);

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

  // Splitting at 'TERM', find all the classes.
  while (true) {
    // Scrape until term 2 is found... (or term one which means end of table)
    while (
      data[rowStartIndex] &&
      !data[rowStartIndex].includes('TERM TWO') &&
      rowStartIndex < data.length
    ) {
      // Store data for each class
      const classData = {};

      // The data is in groups of 7.
      // First 5 are similar in format and are:
      // activity(tut/lec), term number, class id, section id, status(open/full)
      let fields = ['activity', 'term', 'classID', 'section', 'status'];
      let regex = />([^\<]+)</;

      // Execute the regex on each field
      for (let field of fields) {
        let result = regex.exec(data[rowStartIndex]);
        classData[field] = result[1];
        rowStartIndex++;
      }

      // The sixth field
      // re
    }
    break;
  }

  // for (let i = data.length - 1; i >= data.length - 50; i--) {
  //   if (data[i]) {
  //     console.log(data[i]);
  //   }
  // }

  console.log(courseData);
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
        console.log('opening ' + url);
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

          await scrapePage(page);
          throw new Error('its my error boi');
          i++;

          if (i == 2) {
            break;
          }
        }
      } catch (err) {
        console.log(err);
        throw new Error('Double??');
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
