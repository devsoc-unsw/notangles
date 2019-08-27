import * as puppeteer from 'puppeteer';

// Temp import
const fs = require('fs');

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

  // console.log(data[rowStartIndex]);
  let fields = ['classID', 'section', 'term', 'activity'];
  for (let field of fields) {
    // Store the term number to later append to the correct term
    if (field === 'term') {
      // console.log(data[rowStartIndex], rowStartIndex);
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
      // console.log(data[rowStartIndex]);
      // console.log('aborted');
      return [[], rowStartIndex + 9, -1];
    }
    classData[field] = data[rowStartIndex];
    rowStartIndex++;
  }

  // console.log(data[rowStartIndex]);
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
    // console.log(data[rowStartIndex]);
    // Day
    const dateData = {};
    dateData['day'] = data[rowStartIndex];
    rowStartIndex++;

    // Start and end times
    const times = data[rowStartIndex].split(' - ');
    dateData['time'] = { start: times[0], end: times[1] };
    rowStartIndex++;

    // Checking the start and end times for errors
    if (!(times[0] && times[1])) {
      continue;
    }

    let checker = /^[0-9:]+$/;
    if (!(checker.test(times[0]) && checker.test(times[1]))) {
      continue;
    }

    // location
    dateData['location'] = data[rowStartIndex];
    rowStartIndex++;

    // weeks
    dateData['weeks'] = data[rowStartIndex];
    rowStartIndex++;

    // Extra newline
    rowStartIndex++;

    dateList.push(dateData);
    // console.log(dateData);
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

  // console.log(classData);
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
  // Stores data for every course on a page.
  const coursesData = [];
  let rowStartIndex = 0;
  // Get all the data elements.
  const data = await page.$$eval('.data', element =>
    element.map(e => e.innerHTML)
  );

  // for (let x = rowStartIndex; x < data.length; x++) {
  //   console.log(data[x]);
  // }
  // console.log(data[122], data[118], data[119]);
  // throw new Error('testing...');
  // Count of the number of courses on the page
  let count = 0;
  while (rowStartIndex < data.length) {
    // console.log(count);
    // console.log(rowStartIndex);
    // console.log(data[rowStartIndex]);
    // Objects that stores all the data for a single course
    const courseData = {};

    // Get the course code and course name
    const courseHead = await page.evaluate(count => {
      // console.log(count);
      let courseHeader = document.getElementsByClassName(
        'classSearchMinorHeading'
      )[0].innerHTML;
      let regexp = /(^[A-Z]{4}[0-9]{4})(.*)/;
      return regexp.exec(courseHeader);
    });

    courseData['courseCode'] = courseHead[1].trim();
    courseData['name'] = courseHead[2].trim();

    // Getting the course type (undergrad/postgrad)
    while (
      data[rowStartIndex] !== 'Undergraduate' &&
      data[rowStartIndex] !== 'Postgraduate' &&
      data[rowStartIndex] !== 'Research'
    ) {
      rowStartIndex++;
    }

    if (data[rowStartIndex].trim() === 'Undergraduate') {
      courseData['career'] = 0;
    } else if (data[rowStartIndex].trim() === 'Postgraduate') {
      courseData['career'] = 1;
    } else {
      courseData['career'] = 2;
    }

    const termlist = [];
    // Getting the course enrolment. (What is this???)
    for (let i = rowStartIndex; i < data.length; i++) {
      // Getting all the terms that the course is offered in
      // console.log(data[i]);
      if (data[i].charAt(0) === 'U') {
        termlist.push(data[i]);
      } else if (/^T[1-3]$/.test(data[i])) {
        termlist.push(data[i]);
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
    // console.log(data);
    // console.log(rowStartIndex, data[rowStartIndex]);

    // Get class list
    const classList = [];
    const summer = [];
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

    // Scrape all the class data
    while (data[rowStartIndex] && rowStartIndex < data.length - 1) {
      // If this is at a term boundary, then move row index
      // or any other alignment issues.
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

      const classData = await getClassData(data, rowStartIndex);

      // Depending on the term, append to respective list.
      // console.log('Term no --------------------> ', classData[2]);
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

      // console.log('returned line ---> ', data[rowStartIndex]);
      // Special case -> no classes lead to end of page
      if (!data[rowStartIndex]) {
        // console.log(data[rowStartIndex - 1], rowStartIndex, data.length);
        break;
      }

      // Special case -> end of data/page has both undergrad
      // and postgrad details...
      // or page ended (two back to tops signal this.)
      if (data[rowStartIndex].includes('Back to top')) {
        if (
          (data[rowStartIndex - 1] &&
            data[rowStartIndex - 1].includes('Back to top')) ||
          (data[rowStartIndex + 1] &&
            data[rowStartIndex + 1].includes('Back to top'))
        ) {
          break;
        }

        if (rowStartIndex >= data.length - 3) {
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
    if (data[rowStartIndex + 1]) {
      // console.log(rowStartIndex, data[rowStartIndex], data.length);
      if (data[rowStartIndex].includes('Back to top')) {
        rowStartIndex++;
        // console.log(rowStartIndex, data[rowStartIndex], data.length);
      } else {
        break;
      }
    } else {
      // console.log(rowStartIndex, data[rowStartIndex - 1], data.length);
      break;
    }
    count++;
  }
  // for (let i = data.length - 1; i >= data.length - 50; i--) {
  //   if (data[i]) {
  //     console.log(data[i]);
  //   }
  // }
  console.log(coursesData);
  return coursesData;
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

    // JSON Array to store the course data.
    const scrapedData = [];

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
          // console.log(course);
          await page.goto(course, {
            waitUntil: 'networkidle2'
          });

          // await page.goto('http://timetable.unsw.edu.au/2019/MBAX9139.html', {
          //   waitUntil: 'networkidle2'
          // });
          const courseData = await scrapePage(page);
          // console.log(courseData);
          // throw new Error();
          for (let c of courseData) {
            scrapedData.push(c);
          }
          // console.log(courseData);
        }
      } catch (err) {
        console.log(err);
        throw new Error('double');
      }
    }

    console.log(scrapedData);

    // const testData = [{ ok: 'cool' }];
    // Write to file!
    fs.writeFile('scraped.json', JSON.stringify(scrapedData), 'utf8', err => {
      if (err) {
        throw err;
      }
      console.log('Operation completed!!');
    });

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
