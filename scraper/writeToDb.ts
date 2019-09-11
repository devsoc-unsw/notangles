import { timetableScraper } from './scraper'
import Database from '../server/dbApi'

// Assuming data is like the db schema
timetableScraper().then(function(terms) {
  for (const term of terms) {
    // Get the name of the term collection
    const termColName: string = term.name

    for (const course of term) {
      if (Database.dbRead(termColName, course.courseCode) === null) {
        Database.dbAdd(termColName, course)
      } else {
        Database.dbUpdate(termColName, course.courseCode, course)
      }
    }
  }
})
