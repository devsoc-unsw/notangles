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


// from previous deleted branch 
// import * as puppeteer from 'puppeteer';

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
