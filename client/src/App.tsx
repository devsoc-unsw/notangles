import React from 'react'
import Select from 'react-select'

import TimeTable, { ClassTime } from './components/timetable'
import Navbar from './components/navbar'
import CourseInventory from './components/courseInventory'

import styled from 'styled-components'

// interface IOption {
//   value: string
//   label: string
// }

// const options: IOption[] = [
//   { value: 'comp1511', label: 'COMP1511' },
//   { value: 'comp2511', label: 'COMP2511' },
//   { value: 'comp2411', label: 'COMP2411' },
//   { value: 'arts1234', label: 'ARTS1234' },
// ]

export interface Course {
  id: string
  classes: ClassTime[]
  label: string
  value: string
}

const testCourses: Course[] = [
  { id: 'COMP1511', classes: [[1, 1, 2], [1, 4, 6]], label: 'COMP1511', value: 'COMP1511' },
  { id: 'COMP1521', classes: [[1, 2, 3], [2, 2, 3]], label: 'COMP1521', value: 'COMP1521' },
  { id: 'COMP1531', classes: [[3, 4, 7], [1, 1, 3]], label: 'COMP1531', value: 'COMP1531' },
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

  const [value, setValue] = React.useState<Course>()
  const [addedCourses, setCourses] = React.useState<Course[]>([])

  const handleChange = (e: Course) => {
    setValue(e)
    setCourses([...addedCourses, e])
  }

  return (
    <div className="App">
      <Navbar />
      <StyledApp>
        <SelectWrapper>
          <span>Add a course</span>
          <StyledSelect
            options={testCourses}
            value={value}
            onChange={handleChange}
          />
        </SelectWrapper>
        Selected course: {value ? value.id : 'No course selected'}
        <CourseInventory
          addedCourses={addedCourses}
        />
        <TimeTable
          testCourses={testCourses}
        />
      </StyledApp>
    </div>
  )
}

export default App
