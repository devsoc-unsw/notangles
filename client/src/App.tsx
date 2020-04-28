import React, { useEffect, FunctionComponent, useState } from 'react'
import styled from 'styled-components'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { Timetable } from './components/timetable/Timetable'
import Navbar from './components/Navbar'
import Inventory from './components/inventory/Inventory'
import { CourseData } from './interfaces/CourseData'
import CourseSelect from './components/CourseSelect'

import { getCourseInfo } from './api/getCourseInfo'
import { useColorMapper } from './hooks/useColorMapper'
import { Helmet } from 'react-helmet'

import storage from './utils/storage'
import Box from '@material-ui/core/Box'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'

export interface CourseOption {
  value: string
  label: string
}

const StyledApp = styled(Box)`
  height: 85vh;
  padding: 10px 20%;

  display: grid;
  grid-template-rows: 1fr 1fr 90%
  grid-template-columns: auto;

  text-align: center;
`

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  height: 30px;
`

const darkTheme = createMuiTheme ({
  palette: {
    type: 'dark',
    secondary: {
      main: "rgba(255, 255, 255, 0.2)"
    }
  },
})

const lightTheme = createMuiTheme ({
  palette: {
    secondary: {
      main: "rgba(0, 0, 0, 0.2)"
    }
  }
})

const App: FunctionComponent = () => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'))
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'))

  const assignedColors = useColorMapper(
    selectedCourses.map(course => course.courseCode)
  )
  
  useEffect(() => {
    storage.set('is12HourMode', is12HourMode)
    storage.set('isDarkMode', isDarkMode)
  }, [is12HourMode, isDarkMode])

  const handleSelectCourse = async (e: CourseOption) => {
    const selectedCourseClasses = await getCourseInfo('2020', 'T1', e.value)

    if (selectedCourseClasses) {
      setSelectedCourses([...selectedCourses, selectedCourseClasses])
    }
  }

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter(
      course => course.courseCode !== courseCode
    )
    setSelectedCourses(newSelectedCourses)
    setSelectedClassIds(
      selectedClassIds.filter(id => id.split('-')[0] !== courseCode)
    )
  }

  const handleRemoveClass = (activityId: string) => {
    const newSelectedClassIds = selectedClassIds.filter(
      id => !id.startsWith(activityId)
    )
    console.log(activityId)
    setSelectedClassIds(newSelectedClassIds)
  }

  const handleSelectClass = (classId: string) => {
    const [courseCode, activity] = classId.split('-')
    const newSelectedClassIds = selectedClassIds.filter(
      id => !id.startsWith(`${courseCode}-${activity}`)
    )
    newSelectedClassIds.push(classId)
    setSelectedClassIds(newSelectedClassIds)
  }

  return (
    <MuiThemeProvider theme = { isDarkMode ? darkTheme : lightTheme }>
      <div className="App">
        <Helmet>
          <style>
            {isDarkMode ? 'body { background-color: #202020; }': 'body { background-color: white; }'}
          </style>
        </Helmet>
        <Navbar
          setIsDarkMode={setIsDarkMode}
          isDarkMode={isDarkMode}
        />
        <StyledApp color="text.primary">
          <SelectWrapper>
            <CourseSelect
              onChange={handleSelectCourse}
              isDarkMode={isDarkMode}
            />
          </SelectWrapper>
          <DndProvider backend={HTML5Backend}>
            <Inventory
              selectedCourses={selectedCourses}
              selectedClassIds={selectedClassIds}
              assignedColors={assignedColors}
              removeCourse={handleRemoveCourse}
              removeClass={handleRemoveClass}
            />
            <Timetable
              selectedCourses={selectedCourses}
              selectedClassIds={selectedClassIds}
              assignedColors={assignedColors}
              is12HourMode={is12HourMode}
              setIs12HourMode={setIs12HourMode}
              onSelectClass={handleSelectClass}
            />
          </DndProvider>
        </StyledApp>
      </div>
    </MuiThemeProvider>
  )
}

export default App
