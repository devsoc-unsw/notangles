import { timetableScraper } from './scraper'
import Database from '../server/dbApi'
import * as data2 from './data.json'
import { TimetableData, Course, Class, Time } from './interfaces'

const main = async () => {
  //writing the data to the database
  let date = new Date()
  const year = date.getFullYear().toString(10)
  const terms = await timetableScraper(date.getFullYear())
  for (const [termName, term] of Object.entries(terms.timetableData)) {
    for (const course of term) {
      const ret = await Database.dbRead(year, termName, course.courseCode)
      if (ret === null) {
        await Database.dbAdd(year, termName, course)
      } else {
        await Database.dbUpdate(year, termName, course.courseCode, course)
      }
    }
  }
  Database.disconnect
}

main().then(() => process.exit())
