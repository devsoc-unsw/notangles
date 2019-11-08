import React from 'react'
import Select from 'react-select'

import TimeTable from './components/timetable'
import Navbar from './components/navbar'

import styled from 'styled-components'
import getCourseInfo from './components/getCourseInfo'

interface CourseOption {
  value: string
  label: string
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
  const handleChange = (e: any) => {
    setValue(e)
  }

  React.useEffect(() => {
    fetch('http://localhost:3001/api/terms/2019-T1/courses/COMP1511/')
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        console.log(JSON.stringify(myJson))
      })
      .catch(function(err) {
        console.log('Fetch Error :-S', err)
      })
  }, [])

  React.useEffect(() => {
    getCourseInfo('2019', 'T1', 'COMP2521')
  }, [])

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
