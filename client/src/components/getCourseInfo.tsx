import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import {
  DBClass,
  DBCourse,
  DBTime,
  DBTimes,
  dbCourseToCourseData,
} from '../interfaces/dbCourse'
import {
  CourseData,
  ClassData,
  Period,
  ClassTime,
} from '../interfaces/courseData'

const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string
) => {
  const ty = year + '-' + term
  try {
    const data = await fetch(
      'http://localhost:3001/api/terms/' + ty + '/courses/' + courseCode + '/'
    )
    const json: DBCourse = await data.json()
    if (json == null) {
      throw Error('Fetch did not get results')
    }

    return dbCourseToCourseData(json)
  } catch (error) {
    console.error(error)
    return null
  }
}

export default getCourseInfo
