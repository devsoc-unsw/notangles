import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'styled-components'

import Cell from './cell'
import CourseClass from './courseClass'
import { ClassData, CourseData, Period } from '../interfaces/courseData'

export interface Course {
  id: string
  classes: ClassTime[]
}

export interface SelectedCourseValue {
  classTime: ClassData
  period: Period
}

// [day, from, to]
export type ClassTime = [number, number, number]

const testCourses: Course[] = [
  {
    id: 'COMP1511',
    classes: [
      [1, 1, 2],
      [1, 4, 6],
    ],
  },
  {
    id: 'COMP1521',
    classes: [
      [1, 2, 3],
      [2, 2, 3],
    ],
  },
  {
    id: 'COMP1531',
    classes: [
      [3, 4, 7],
      [1, 1, 3],
    ],
  },
]

const BaseCell = styled.div<{ x: number; y: number }>`
  grid-column: ${props => props.x};
  grid-row: ${props => props.y};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const StyledTimetable = styled.div`
  display: grid;
  grid-template: auto / repeat(6, 1fr);

  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`

interface TimetableProps {
  selectedCourses: CourseData[]
}

const Timetable: React.FC<TimetableProps> = props => {
  let colourIndex: number = 0
  const colours: string[] = [
    'violet',
    'indigo',
    'blue',
    'green',
    'yellow',
    'orange',
    'red',
  ]
  const hours: string[] = [
    '9:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]
  const days: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]
  const assigned: Record<string, string> = {}

  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, SelectedCourseValue>
  >({})

  const handleDrop = (
    classTime: ClassData,
    course: CourseData,
    period: Period
  ) => {
    setSelectedCourses({
      ...selectedCourses,
      [`${course.courseCode} ${classTime.activity} ${JSON.stringify(
        classTime.periods
      )}`]: { classTime: classTime, period: period },
    })
  }

  /* Constructing the timetable grid of cells */
  const cellsGrid: JSX.Element[][] = []
  const daysRow: JSX.Element[] = [<BaseCell key={0} x={1} y={1} />]
  days.forEach((day, x) =>
    daysRow.push(
      <BaseCell key={x + 2} x={x + 2} y={0}>
        {day}
      </BaseCell>
    )
  )
  cellsGrid.push(daysRow)
  hours.forEach((hour, y) => {
    const hoursRow: JSX.Element[] = []
    hoursRow.push(
      <BaseCell x={1} y={y + 2}>
        {hour}
      </BaseCell>
    )
    days.forEach((_, x) => hoursRow.push(<BaseCell x={x + 2} y={y + 2} />))
    cellsGrid.push(hoursRow)
  })

  /* Constructing the cells which are drop targets for all potential classes */
  const allCourseTimes = props.selectedCourses.map(course =>
    course.classes.map(classData =>
      classData.periods.map(period => (
        <Cell
          // key={`${course.courseCode} ${classData.activity}`}
          onDrop={() => handleDrop(classData, course, period)}
          course={course}
          classTime={period}
          classData={classData}
        />
      ))
    )
  )

  const getStyle = (id: string): string => {
    if (!(id in assigned)) {
      if (colourIndex > colours.length) {
        // Hardcoded value
        return 'orange'
      }
      assigned[id] = colours[colourIndex]
      colourIndex++
    }
    return assigned[id]
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <StyledTimetable>
        {cellsGrid}
        {allCourseTimes}
        {props.selectedCourses.map(course =>
          course.classes.map(classData => (
            <CourseClass
              // key={course.courseCode}
              course={course}
              classData={classData}
              selectedCourse={
                selectedCourses[
                  `${course.courseCode} ${classData.activity} ${JSON.stringify(
                    classData.periods
                  )}`
                ]
              }
              colour={getStyle(course.courseCode)}
            />
          ))
        )}
      </StyledTimetable>
    </DndProvider>
  )
}

export default Timetable
