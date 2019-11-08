import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { Course, ClassTime } from './timetable'

const getCourseInfo = (
  year: string,
  term: string,
  courseCode: string
): void => {
  const ty = year + '-' + term
  fetch(
    'http://localhost:3001/api/terms/' + ty + '/courses/' + courseCode + '/'
  )
    .then(function(response) {
      return response.json()
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson))
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err)
    })
}

export default getCourseInfo
