import { timetableScraper } from './scraper'
import Database, { dbReadParams, dbAddParams, dbUpdateParams } from '../server/src/database'
import { TimetableData, Course, Class, Time } from './interfaces'

const main = async () => {
  //writing the data to the database
  let date = new Date()
  //const year = date.getFullYear().toString(10)
  //Scraper has a bug with 2020, changing year to be fixed to to 2019 temporarily so other tasks cannot be blocked
  const year = "2019"
  const terms = await timetableScraper(date.getFullYear())
  for (const [termName, term] of Object.entries(terms.timetableData)) {
    for (const course of term) {
      const read_params : dbReadParams = {
        dbName : year, 
        termColName : termName, 
        courseCode : course.courseCode
      }
      const ret = await Database.dbRead(read_params)
      if (ret === null) {
        const add_params : dbAddParams = {
          dbName : year, 
          termColName : termName, 
          doc : course
        }
        await Database.dbAdd(add_params)
      } else {
        const update_params : dbUpdateParams = {
          dbName : year, 
          termColName: termName, 
          courseCode: course.courseCode, 
          doc: course
        }
        await Database.dbUpdate(update_params)
      }
    }
  }
  Database.disconnect
}

main().then(() => process.exit())
