import { timetableScraper } from '../src/scraper'
import Database from '../src/database'
import { dbReadParams, dbUpdateParams, dbAddParams } from '../src/database'
require('dotenv').config()

const main = async () => {
  //writing the data to the database
  const year = process.env.TIMETABLE_YEAR
  const terms = await timetableScraper(Number(year))

  // Error occured in scraper. Could not scrape data
  if (!terms) {
    return false
  }

  for (const [termName, term] of Object.entries(terms.timetableData)) {
    for (const course of term) {
      const readArgs: dbReadParams = {
        dbName: year,
        termColName: termName,
        courseCode: course.courseCode,
      }
      const ret = await Database.dbRead(readArgs)
      if (ret === null) {
        const addArgs: dbAddParams = {
          dbName: year,
          termColName: termName,
          doc: course,
        }
        await Database.dbAdd(addArgs)
      } else {
        const updateArgs: dbUpdateParams = {
          dbName: year,
          termColName: termName,
          courseCode: course.courseCode,
          doc: course,
        }
        await Database.dbUpdate(updateArgs)
      }
    }
  }
  Database.disconnect()
}

main().then(() => process.exit())
