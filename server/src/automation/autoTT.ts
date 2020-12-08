import {
  Activity,
} from '@notangles/common'
import Database from '../database'
import { dbReadParams } from '../database'
import { exit } from 'process'

interface DbCourse {
  courseCode: string
  name: string
  classes: DbClass[]
}

interface DbClass {
  activity: string
  times: DbTimes[]
  courseEnrolment: DbCourseEnrolment
  term: string
  classID: string
}

interface DbCourseEnrolment {
  enrolments: number
  capacity: number
}

interface DbTimes {
  time: DbTime
  day: string
  location: string
  weeks: string
}

interface DbTime {
  start: string
  end: string
}

interface autoCourse {
  code: string
  exclude: Activity[]
}

interface sortClass {
  id: string
  code: string
  time: DbTimes[]
  activity: string
}

export interface autoCourses {
  courses: autoCourse[]
  term: string
  year: number
  criteria: {}
  includeClashes: boolean
}


export const autoTT = async (courses: autoCourses) => {
  const dbCourses : DbCourse[] = []

  // not using a foreach loop as async function calls cannot be made in a foreach loop
  // Get more information from the db and change the datatype to sortCourse
  for (const course of courses['courses']) {
    const args: dbReadParams = {
      dbName: courses.year.toString(),
      termColName: courses.term,
      courseCode: course.code,
    }
    try {
      dbCourses.push(await Database.dbRead(args))
    } catch (error) {
      console.log("error")
      exit(1)
    }
  }

  const classDict : Record<string, sortClass[]> = {}
  dbCourses.forEach(course => {
    const sortClasses : sortClass[] = []
    course.classes.forEach(clas => {
      let exclude = false
      courses.courses.forEach(c => {
        if (c.code == course.courseCode) {
          c.exclude.forEach(act => {
            if (clas.activity == act) {
              exclude = true
            }
          })
        }
      })


      if (exclude == false) {
        const dictString = course.courseCode + "-" + clas.activity
        if (classDict[dictString] === undefined) {
          classDict[dictString] = []
        }

        const sortClass : sortClass = {
          id : clas.classID,
          code : course.courseCode,
          time: clas.times,
          activity : clas.activity,
        }
        
        classDict[dictString].push(sortClass)
      }
    })
  })

  // find best tt
  let maxScore : number = -1
  let index : number = 0
  let bestTT : sortClass[] = []

  const key : string = Object.keys(classDict)[index]
  classDict[key].forEach(clas => {
    let newTT : sortClass[] = []
    newTT.push(clas)
    newTT = fillTT(classDict, newTT, index + 1, courses.criteria, courses.includeClashes)
    let score = calc(newTT, courses.criteria)
    if (score > maxScore) {
      bestTT = newTT.slice(0)
      maxScore = score
    }
  })
  bestTT.forEach(c => {
    console.log("Class")
    console.log(c)
  })
}

const fillTT = (classDict : Record<string, sortClass[]>, TT : sortClass[], index : number, criteria : {}, includeClashes : boolean) => {
  if (index >= Object.keys(classDict).length) {
    return TT
  }

  let maxScore : number = -1
  let bestTT : sortClass[] = []
  const key : string = Object.keys(classDict)[index]
  classDict[key].forEach(clas => {
    let newTT : sortClass[] = TT.slice(0)

    let clashing = false

    if (includeClashes == false) {
      newTT.forEach(t => {
        if (clash(clas.time, t.time) == true) {
          clashing = true
        }
      })
    }

    if (clashing == false) {
      newTT.push(clas)
      newTT = fillTT(classDict, newTT, index + 1, criteria, includeClashes)
      let score = calc(newTT, criteria)
      if (score > maxScore) {
        bestTT = newTT.slice(0)
        maxScore = score
      }
    }
  })
  return bestTT
}

export const clash = (time1 : DbTimes[], time2 : DbTimes[]) => {
  // need to convert to numbers
  let clashing = false
  time1.forEach(t1 => {
    time2.forEach(t2 => {
      if (t1.day == t2.day) {
        const t1start : number = parseInt(t1.time.start.split(":")[0]) + (parseInt(t1.time.start.split(":")[1]) / 60)
        const t1end : number = parseInt(t1.time.end.split(":")[0]) + (parseInt(t1.time.end.split(":")[1]) / 60)
        const t2start : number = parseInt(t2.time.start.split(":")[0]) + (parseInt(t2.time.start.split(":")[1]) / 60)
        const t2end : number = parseInt(t2.time.end.split(":")[0]) + (parseInt(t2.time.end.split(":")[1]) / 60)
        if (t1start >= t2start && t1start < t2end) {
          clashing = true
        }
      
        if (t1end > t2start && t1end <= t2end) {
          clashing = true
        }
      
        if (t2start >= t1start && t2start < t1end) {
          clashing = true
        }
      
        if (t2end > t1start && t2end <= t1end) {
          clashing = true
        }

        // check weeks

        if (clashing == true) {
          return clashing
        }
      }
    })
  })

  return clashing
}

const calc = (TT : sortClass[], criteria : {}) : number => {
  let score = 0
  const maxVal = 10
  if (criteria["daysAtUni"] != undefined) {
    const days : Record<string, boolean> = {}
    TT.forEach(act => {
      act.time.forEach(t => {
        if (days[t.day] == undefined) {
          days[t.day] = true
        }
      })
    })

    let count = 0
    Object.keys(days).forEach(day => {
      count++
    })

    if (criteria["daysAtUni"] < 0) {
      // least amount of days at uni
      score += ((5 - count) / 5) * maxVal * -1 * criteria["daysAtUni"]
    } else {
      // most amount of days at uni
      score += (count / 5) * maxVal * criteria["daysAtUni"]
    }
  }

  if (criteria["napTime"] != undefined) {
    let max : number = 0
    let total = 0
    TT.forEach(clas => {
      clas.time.forEach(t => {
        const start : number = parseInt(t.time.start.split(":")[0])
        total += start - 9
        max += 12
      })
    })
    if (criteria["napTime"] < 0) {
      // least nap time
      score += (1 - (total / max)) * maxVal * -1 * criteria["napTime"]
    } else {
      // most nap time
      score += (total / max) * maxVal * criteria["napTime"]
    }

  }

  if (criteria["breakTime"] != undefined) {
    let total = 0
    let max = 0
    TT.forEach(clas1 => {
      clas1.time.forEach(t1 => {
        TT.forEach(clas2 => {
          clas2.time.forEach(t2 => {
            if (t1.day == t2.day) {
              const t1start : number = parseInt(t1.time.start.split(":")[0]) + (parseInt(t1.time.start.split(":")[1]) / 60)
              const t1end : number = parseInt(t1.time.end.split(":")[0]) + (parseInt(t1.time.end.split(":")[1]) / 60)
              const t2start : number = parseInt(t2.time.start.split(":")[0]) + (parseInt(t2.time.start.split(":")[1]) / 60)
              const t2end : number = parseInt(t2.time.end.split(":")[0]) + (parseInt(t2.time.end.split(":")[1]) / 60)
              
              if (t1start < t2start) {
                total += t2start - t1end
              } else {
                total += t1start - t2end
              }
              max += 11
            }
          })
        })
      })
    })

    if (criteria["breakTime"] < 0) {
      // least amount of break time
      score += (1 - (total / max)) * maxVal * -1 * criteria["breakTime"]
    } else {
      // most amount of break time
      score += (total / max) * maxVal * criteria["breakTime"]
    }
  }

  return score
}

const request: autoCourses = {
  courses: [
    {
      code: 'MATH1081',
      exclude: [],
    },
    {
      code: 'COMP1511',
      exclude: ["Lecture"],
    }
  ],
  year: 2020,
  term: 'T3',
  criteria: { daysAtUni: -10, napTime: 1, breakTime: 5 },
  includeClashes: false,
}

autoTT(request)