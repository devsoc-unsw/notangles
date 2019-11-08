import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'styled-components'

import Cell from './cell'
import CourseClass from './courseClass'

export interface Course {
  id: string
  classes: ClassTime[]
}

// [day, from, to]
export type ClassTime = [number, number, number]

const testCourses: Course[] = [
  { id: 'COMP1511', classes: [[1, 1, 2], [1, 4, 6]] },
  { id: 'COMP1521', classes: [[1, 2, 3], [2, 2, 3]] },
  { id: 'COMP1531', classes: [[3, 4, 7], [1, 1, 3]] },
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

const Timetable: React.FC = () => {
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

  const [courses] = useState<Course[]>(testCourses)
  const [selectedCourses, setSelectedCourses] = useState<
    Record<string, ClassTime>
    >({})

  const handleDrop = (classTime: ClassTime, course: Course) => {
    setSelectedCourses({
      ...selectedCourses,
      [course.id]: classTime,
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
  const allCourseTimes = courses.map(course =>
    course.classes.map(classTime => (
      <Cell
        key={`${course}${classTime}`}
        onDrop={() => handleDrop(classTime, course)}
        course={course}
        classTime={classTime}
      />
    ))
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <StyledTimetable>
        {cellsGrid}
        {allCourseTimes}
        {courses.map(course => (
          <CourseClass
            key={course.id}
            course={course}
            classTime={selectedCourses[course.id]}
          />
        ))}
      </StyledTimetable>
    </DndProvider>
  )
}

export default Timetable
