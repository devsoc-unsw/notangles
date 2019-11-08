import React, { useEffect } from 'react'
import Select from 'react-select'

import TimeTable, { Course } from './components/timetable'
import Navbar from './components/navbar'

import styled from 'styled-components'

interface CourseOption {
  value: string
  label: string
}

interface CourseOverview {
  courseCode: string
  name: string
  id: string
}

const options: CourseOption[] = [
  { value: 'comp1511', label: 'COMP1511' },
  { value: 'comp2511', label: 'COMP2511' },
  { value: 'comp2411', label: 'COMP2411' },
  { value: 'arts1234', label: 'ARTS1234' },
]

const StyledApp = styled.div`
  height: 85vh;
  padding: 10px 20%;

  display: grid;
  grid-template: 2fr 1fr 80% / auto;

  text-align: center;
  background-color: white;
`

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledSelect = styled(Select)`
  width: 100%;
`

const App: React.FC = () => {
  const [value, setValue] = React.useState<CourseOption>()

  // List of courses
  const [coursesList, setCoursesList] = React.useState<CourseOverview[]>()
  const [options, setOptions] = React.useState<CourseOption[]>()
  const handleChange = (e: any) => {
    console.log(e)
    setValue(e)
  }

  // Once -> when the app is rendered
  useEffect(() => {
    fetch('http://localhost:3001/api/terms/2019-T1/courses')
      .then(response => response.json())
      .then(result => {
        console.log(result)
        setCoursesList(result)
      })
    console.log(options)
    // setOptions(options)
  }, [])

  useEffect(() => {
    console.log('something')
    if (coursesList) {
      setOptions(
        coursesList
          .filter((value, index) => {
            return index < 10
          })
          .map(course => {
            const option: CourseOption = {
              value: course.courseCode,
              label: course.courseCode + ' - ' + course.name,
            }
            return option
          })
      )
    }
  }, [coursesList])

  // useEffect(() => {
  //   fetch('http://localhost:3001/api/terms/2019-T1/courses/COMP1511/')
  //     .then(function(response) {
  //       return response.json()
  //     })
  //     .then(function(myJson) {
  //       console.log(JSON.stringify(myJson))
  //     })
  //     .catch(function(err) {
  //       console.log('Fetch Error :-S', err)
  //     })
  // }, [])

  return (
    <div className="App">
      <Navbar />
      <StyledApp>
        <SelectWrapper>
          <span>Add a course</span>
          <StyledSelect
            options={options}
            value={value}
            onChange={handleChange}
          />
        </SelectWrapper>
        Selected course: {value ? value.label : 'No course selected'}
        <TimeTable />
      </StyledApp>
    </div>
  )
}

export default App
