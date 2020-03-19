import { timetableScraper } from './scraper'
// This function is for devlopment purposes only. Use npm run scraper to test the scraper
;(async () => {
  console.time('cscraper')
  try {
    const data = await timetableScraper(2020)

    if (data === false) {
      return
    }

    const fs = require('fs')
    fs.writeFile(
      'Other.json',
      JSON.stringify(data.timetableData.Other),
      'utf-8',
      (err: unknown) => {
        if (err) {
          console.error(err)
        }
      }
    )

    fs.writeFile(
      'T1.json',
      JSON.stringify(data.timetableData.T1),
      'utf-8',
      (err: unknown) => {
        if (err) {
          console.error(err)
        }
      }
    )
  } catch (err) {
    console.log(err)
  }
  console.timeEnd('cscraper')
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(
      `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    )
  }
})()
