import * as puppeteer from 'puppeteer'
import { scrapeSubject } from '../src/scraper'
// Devlopment only
;(async () => {
  console.time('cscraper')
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'DEV' ? false : true,
  })
  try {
    const singlepage = await browser.newPage()
    const data = await scrapeSubject({
      page: singlepage,
      course: 'http://timetable.unsw.edu.au/2020/SOSS3006.html',
    })

    console.log(JSON.stringify(data))

    const fs = require('fs')
    fs.writeFile(
      'T1.json',
      JSON.stringify(data.coursesData.T2),
      'utf-8',
      (err: unknown) => {
        if (err) {
          console.error(err)
        }
      }
    )
    fs.writeFile(
      'T1Warn.json',
      JSON.stringify(data.courseWarnings),
      'utf-8',
      (err: unknown) => {
        if (err) {
          console.error(err)
        }
      }
    )
  } catch (err) {
    console.log(err)
  } finally {
    await browser.close()
  }
  console.timeEnd('cscraper')
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(
      `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    )
  }
})()
