import { Activity } from '@notangles/common'
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

interface SortClass {
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
  // get course data from db
  const dbCourses: DbCourse[] = await Promise.all(
    courses.courses.map(async (course) => {
      const args: dbReadParams = {
        dbName: courses.year.toString(),
        termColName: courses.term,
        courseCode: course.code,
      }
      try {
        return await Database.dbRead(args)
      } catch (error) {
        console.log('error')
        exit(1)
      }
    })
  )

  // preprocessing the excludes
  const excludedDict: Record<string, Set<string>> = {}
  courses.courses.forEach((course) => {
    excludedDict[course.code] = new Set()
    for (const excluded of course.exclude) {
      excludedDict[course.code].add(excluded)
    }
  })

  // maps an activity and course group to an index
  const mapper: Record<string, Record<string, number>> = {}
  const classGroups: SortClass[][] = []
  let next = 0
  dbCourses.forEach((course) => {
    mapper[course.courseCode] = {}
    course.classes.forEach((cls) => {
      if (excludedDict[course.courseCode].has(cls.activity)) {
        return
      }
      if (!mapper[course.courseCode][cls.activity]) {
        mapper[course.courseCode][cls.activity] = next
        next++
      }
      const index = mapper[course.courseCode][cls.activity]
      if (!classGroups[index]) {
        classGroups[index] = []
      }
      const sortClass: SortClass = {
        id: cls.classID,
        code: course.courseCode,
        time: cls.times,
        activity: cls.activity,
      }
      classGroups[index].push(sortClass)
    })
  })

  const classDict: Record<string, SortClass[]> = {}
  dbCourses.forEach((course) => {
    course.classes.forEach((clas) => {
      let exclude = false
      courses.courses.forEach((c) => {
        if (c.code === course.courseCode) {
          c.exclude.forEach((act) => {
            if (clas.activity === act) {
              exclude = true
            }
          })
        }
      })

      if (!exclude) {
        const dictString = course.courseCode + '-' + clas.activity
        if (!classDict[dictString]) {
          classDict[dictString] = []
        }

        const sortClass: SortClass = {
          id: clas.classID,
          code: course.courseCode,
          time: clas.times,
          activity: clas.activity,
        }

        classDict[dictString].push(sortClass)
      }
    })
  })

  // find best tt
  let maxScore: number = -1
  let index: number = 0
  let bestTT: SortClass[] = []

  const key: string = Object.keys(classDict)[index]
  classDict[key].forEach((clas) => {
    let newTT: SortClass[] = []
    newTT.push(clas)
    newTT = fillTT(
      classDict,
      newTT,
      index + 1,
      courses.criteria,
      courses.includeClashes
    )
    let score = calc(newTT, courses.criteria)
    if (score > maxScore) {
      bestTT = newTT.slice(0)
      maxScore = score
    }
  })

  let ret = {}
  bestTT.forEach((act) => {
    if (!ret[act.code]) {
      ret[act.code] = {}
    }
    ret[act.code][act.activity] = act.id
  })

  return ret
}

const fillTT = (
  classDict: Record<string, SortClass[]>,
  TT: SortClass[],
  index: number,
  criteria: {},
  includeClashes: boolean
) => {
  if (index >= Object.keys(classDict).length) {
    return TT
  }

  let maxScore: number = -1
  let bestTT: SortClass[] = []
  const key: string = Object.keys(classDict)[index]
  classDict[key].forEach((clas) => {
    let newTT: SortClass[] = TT.slice(0)

    let clashing = false

    if (includeClashes === false) {
      newTT.forEach((t) => {
        if (clash(clas.time, t.time) === true) {
          clashing = true
        }
      })
    }

    if (clashing === false) {
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

export const clash = (time1: DbTimes[], time2: DbTimes[]) => {
  // need to convert to numbers
  let clashing = false
  time1.forEach((t1) => {
    time2.forEach((t2) => {
      if (t1.day === t2.day) {
        const t1start: number = extractTime(t1.time.start)
        const t1end: number = extractTime(t1.time.end)
        const t2start: number = extractTime(t2.time.start)
        const t2end: number = extractTime(t2.time.end)
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

        if (clashing === true) {
          return clashing
        }
      }
    })
  })

  return clashing
}

const calc = (TT: SortClass[], criteria: {}): number => {
  // Times are in minutes
  const maxBreakTime = 11 * 60
  const earliestStartTime = 8 * 60
  const latestTime = 21 * 60
  let score = 0
  const maxVal = 10
  if (criteria['daysAtUni'] !== undefined) {
    const days: Record<string, boolean> = {}
    TT.forEach((act) => {
      act.time.forEach((t) => {
        if (days[t.day] === undefined) {
          days[t.day] = true
        }
      })
    })

    let count = 0
    Object.keys(days).forEach((day) => {
      count++
    })

    if (criteria['daysAtUni'] < 0) {
      // least amount of days at uni
      score += ((5 - count) / 5) * maxVal * -1 * criteria['daysAtUni']
    } else {
      // most amount of days at uni
      score += (count / 5) * maxVal * criteria['daysAtUni']
    }
  }

  if (criteria['napTime'] !== undefined) {
    let max: number = 0
    let total = 0
    TT.forEach((clas) => {
      clas.time.forEach((t) => {
        const start: number = extractTime(t.time.start)
        total += start - earliestStartTime
        max += (latestTime - earliestStartTime)
      })
    })
    if (criteria['napTime'] < 0) {
      // least nap time
      score += (1 - total / max) * maxVal * -1 * criteria['napTime']
    } else {
      // most nap time
      score += (total / max) * maxVal * criteria['napTime']
    }
  }

  if (criteria['breakTime'] !== undefined) {
    let total = 0
    let max = 0
    TT.forEach((clas1) => {
      clas1.time.forEach((t1) => {
        TT.forEach((clas2) => {
          clas2.time.forEach((t2) => {
            if (t1.day === t2.day) {
              const t1start: number = extractTime(t1.time.start)
              const t1end: number = extractTime(t1.time.end)
              const t2start: number = extractTime(t2.time.start)
              const t2end: number = extractTime(t2.time.end)

              if (t1start < t2start) {
                total += t2start - t1end
              } else {
                total += t1start - t2end
              }
              max += maxBreakTime
            }
          })
        })
      })
    })

    if (criteria['breakTime'] < 0) {
      // least amount of break time
      score += (1 - total / max) * maxVal * -1 * criteria['breakTime']
    } else {
      // most amount of break time
      score += (total / max) * maxVal * criteria['breakTime']
    }
  }

  return score
}

const extractTime = (time: string): number => {
  return (parseInt(time.split(":")[0]) * 60) + parseInt(time.split(":")[1])
}