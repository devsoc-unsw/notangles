import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { DBClass, DBCourse, DBTime, DBTimes } from '../interfaces/dbCourse'

const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string
) => {
  const ty = year + '-' + term
  const json = await fetch(
    'http://localhost:3001/api/terms/' + ty + '/courses/' + courseCode + '/'
  )
    .then(function(response) {
      return response.json()
    })
    .then(function(myJson: DBClass) {
      //console.log(JSON.stringify(myJson))
      return myJson
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err)
    })
  return json
}

export default getCourseInfo
