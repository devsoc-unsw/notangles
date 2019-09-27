import { timetableScraper } from './scraper'
import Database from '../server/dbApi'
import * as data2 from './data.json'

const terms = []
const summer = []
summer.push('Summer')
const t1 = []
t1.push('T1')
const t2 = []
t2.push('T2')
const t3 = []
t3.push('T3')

terms.push(summer)
terms.push(t1)
terms.push(t2)
terms.push(t3)

const data = data2 as any
for (const course of data) {
  if (course.termsOffered.includes('U1')) {
    const newCourse = course
    newCourse.classes = []
    for (const c of course.classes) {
      if (c.term.includes('U1')) {
        newCourse.classes.push(c)
      }
    }
    summer.push(newCourse)
  }

  if (course.termsOffered.includes('T1')) {
    const newCourse = course
    newCourse.classes = []
    for (const c of course.classes) {
      if (c.term.includes('T1')) {
        newCourse.classes.push(c)
      }
    }
    t1.push(newCourse)
  }

  if (course.termsOffered.includes('T2')) {
    const newCourse = course
    newCourse.classes = []
    for (const c of course.classes) {
      if (c.term.includes('T2')) {
        newCourse.classes.push(c)
      }
    }
    t2.push(newCourse)
  }

  if (course.termsOffered.includes('T3')) {
    const newCourse = course
    newCourse.classes = []
    for (const c of course.classes) {
      if (c.term.includes('T3')) {
        newCourse.classes.push(c)
      }
    }
    t3.push(newCourse)
  }
}
console.log('start')
for (const term of terms) {
  // Get the name of the term collection
  const termColName: string = term[0]
  let count = 0
  for (const course of term) {
    if (count === 0) {
      count = 1
      continue
    }
    Database.dbRead(termColName, course.courseCode).then(function(ret) {
      if (ret === null) {
        Database.dbAdd(termColName, course)
      } else {
        Database.dbUpdate(termColName, course.courseCode, course)
      }
    })
  }
}
console.log('Finished')
