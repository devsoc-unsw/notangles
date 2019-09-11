import { timetableScraper } from './scraper'
import Database from '../server/dbApi'
import db from '../server/dbApi'

// Assuming data is like the db schema
timetableScraper().then(function(data) {
  for (let term of data) {
    const termColName = term.name
    for (let course of term) {
      if (Database.dbRead(termColName, course.courseCode) === null) {
        Database.dbAdd(termColName, course)
      } else {
        Database.dbUpdate(termColName, course.courseCode, course)
      }
    }
  }
})
