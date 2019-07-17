import * as puppeteer from 'puppeteer';

// import * as .. does not work for chalk, so require.
const chalk = require('chalk');

const error = chalk.bold.red;
const success = chalk.green;
(async () => {
  // Launch the browser. Headless mode = true by default
  const browser = await puppeteer.launch();
  try {
    let page = await browser.newPage();

    // Go to the timetable page
    await page.goto('http://timetable.unsw.edu.au/2019/subjectSearch.html', {
      waitUntil: 'networkidle2'
    });

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
