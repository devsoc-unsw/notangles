import { timetableScraper } from './scraper'
import Database from '../server/dbApi'
import * as data2 from './data.json'
import { TimetableData, Course, Class, Time } from './interfaces'

const main = async () => {
  //Formatting data into database schema
  /*const summer = []
  const t1 = []
  const t2 = []
  const t3 = []
  const terms = { Summer: summer, T1: t1, T2: t2, T3: t3 }

  const data = data2 as any
  for (const course of data) {
    console.log(course)
    if (course.termsOffered.includes('U1')) {
      const newCourse = { ...course, classes: [] }
      for (const c of course.classes) {
        if (c.term.includes('U1')) {
          newCourse.classes.push(c)
        }
      }
      summer.push(newCourse)
    }

    if (course.termsOffered.includes('T1')) {
      const newCourse = { ...course, classes: [] }

      for (const c of course.classes) {
        if (c.term.includes('T1')) {
          newCourse.classes.push(c)
        }
      }
      t1.push(newCourse)
    }

    if (course.termsOffered.includes('T2')) {
      const newCourse = { ...course, classes: [] }
      for (const c of course.classes) {
        if (c.term.includes('T2')) {
          newCourse.classes.push(c)
        }
      }
      t2.push(newCourse)
    }

    if (course.termsOffered.includes('T3')) {
      const newCourse = { ...course, classes: [] }
      for (const c of course.classes) {
        if (c.term.includes('T3')) {
          newCourse.classes.push(c)
        }
      }
      t3.push(newCourse)
    }
  }*/
  const terms:  = data2
  //writing the data to the database
  let date = new Date()
  Database.setDbname(date.getFullYear().toString(10))
  for (const [termName, term] of Object.entries(terms)) {
    // Get the name of the term collection
    for (const course of term) {
      const ret = await Database.dbRead(termName, course.courseCode)
      if (ret === null) {
        await Database.dbAdd(termName, course)
      } else {
        await Database.dbUpdate(termName, course.courseCode, course)
      }
    }
  }
}

main().then(() => process.exit())
