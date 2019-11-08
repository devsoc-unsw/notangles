import React from 'react'

interface CourseData {
  courseCode: string
  courseName: string
  classes: ClassData[]
}

interface ClassData {
  activity: string
  periods: Period[]
}

interface Period {
  time: ClassTime
  location: string
}

interface ClassTime {
  day: string
  start: string
  end: string
}
