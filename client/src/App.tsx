import React, { useEffect } from 'react'
import Select from 'react-select'
import Axios, { AxiosResponse } from 'axios'

import TimeTable from './components/timetable'
import Navbar from './components/navbar'

import styled from 'styled-components'

export interface CourseData {
  courseCode: string
  courseName: string
  classes: ClassData[]
}

export interface ClassData {
  activity: string
  periods: Period[]
}

export interface Period {
  time: ClassTime
  location: string
}

export interface ClassTime {
  day: string
  start: string
  end: string
}

// ------------------------------------
interface CourseOption {
  value: string
  label: string
}

interface CourseOverview {
  courseCode: string
  name: string
  id: string
}

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
  height: 30px;
`

const StyledSelect = styled(Select)`
  width: 100%;
  text-align: left;
`

const App: React.FC = () => {
  const [courseDataList, setCourseDataList] = React.useState<CourseData[]>()

  const [value, setValue] = React.useState<CourseOption>()

  // List of courses
  const [coursesList, setCoursesList] = React.useState<CourseOverview[]>()
  const [options, setOptions] = React.useState<CourseOption[]>()
  const handleChange = (e: any) => {
    console.log(e)
    setValue(e)
  }

  useEffect(() => {
    console.log(courseDataList)
  }, [courseDataList])

  // Once -> when the app is rendered
  useEffect(() => {
    Axios.get('http://localhost:3001/api/terms/2019-T1/courses')
      .then((res: AxiosResponse<CourseOverview[]>) => {
        const courseOverviews: CourseOverview[] = res.data
        setCoursesList(courseOverviews)

        const courseList: CourseData[] = []

        for (let courseOverview of courseOverviews) {

          Axios.get(`http://localhost:3001/api/terms/2019-T1/courses/${courseOverview.courseCode}`)
            .catch(e => console.log(e))
            .then((res: any) => {
              if (res.data) {
                const course: CourseData = {
                  courseCode: courseOverview.courseCode,
                  courseName: courseOverview.name,
                  classes: res.data.map((classOverview: any) => ({
                    activity: classOverview.activity,
                    periods: classOverview.times.map((periodOverview: any) => ({
                      location: periodOverview.location,
                      time: {
                        day: periodOverview.day,
                        start: periodOverview.time.start,
                        end: periodOverview.time.end,
                      },
                    })),
                  })),
                }
                courseList.push(course)
              }
            })
        }
        setCourseDataList(courseList)
      })
  }, [])

  useEffect(() => {
    if (coursesList) {
      setOptions(
        coursesList.map(course => {
          const option: CourseOption = {
            value: course.courseCode,
            label: course.courseCode + ' - ' + course.name,
          }
          return option
        }),
      )
    }
  }, [coursesList])

  return (
    <div className="App">
      <Navbar/>
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
        <TimeTable/>
      </StyledApp>
    </div>
  )
}

export default App
