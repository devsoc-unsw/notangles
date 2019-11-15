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
  const data = await fetch(
    'http://localhost:3001/api/terms/' + ty + '/courses/' + courseCode + '/'
  )
    .then(function(response) {
      return response.json()
    })
    .then(function(myJson: DBCourse) {
      //console.log(JSON.stringify(myJson))
      return myJson
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err)
      return
    })

  if (data == null) {
    return
  }

  return dbCourseToCourseData(data)
}

export default getCourseInfo
