import * as puppeteer from 'puppeteer'
const chalk = require("chalk");

const error = chalk.bold.red;
const success = chalk.keyword("green");

(async() => {
    try
    {
        // Launch the browser. Headless mode.
        var browser = await puppeteer.launch();
        var page = await browser.newPage();
        
        // Go to the timetable page
        await page.goto('http://timetable.unsw.edu.au/2019/subjectSearch.html', { waitUntil: 'networkidle2' });
        
        // Close the browser.
        await browser.close();
        console.log(success("Browser closed"));
    }
    catch (err) {
        console.log(error(err));
        await browser.close();
        console.log(error("Browser closed"));
    }
})();
