import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { ClassData, CourseData, Period } from '../App'
import { timeToIndex, weekdayToXCoordinate } from './cell'
import { SelectedCourseValue } from './timetable'

export interface CourseClassProps {
  course: CourseData
  classData: ClassData
  selectedCourse?: SelectedCourseValue
}

interface UnselectedCourseClassProps {
  isDragging: boolean
}

const UnselectedCourseClass = styled.div`
  height: 100%;
  width: 100%;

  background-color: orange;
  opacity: ${(props: UnselectedCourseClassProps) =>
  props.isDragging ? 0.5 : 1};

  cursor: move;
`

const StyledCourseClass = styled(UnselectedCourseClass)<{
  classTime: Period
}>`
  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => timeToIndex(props.classTime.time.start)} /
    ${props => timeToIndex(props.classTime.time.end)};
`

const CourseClass: React.FC<CourseClassProps> = ({ course, classData, selectedCourse }) => {
  const [{ isDragging, opacity }, drag] = useDrag({
    item: { type: `${course.courseCode} ${classData.activity}` },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  // TODO: make this more accurate - don't rely on courseCode + activity since if one block gets dropped into a cell all of the other blocks of the same type will also move into that cell
  if (selectedCourse) {
    return (
      <StyledCourseClass
        ref={drag}
        isDragging={isDragging}
        style={{ cursor: 'move' }}
        classTime={selectedCourse.period}
      >
        {`${course.courseCode} ${classData.activity}`}
      </StyledCourseClass>
    )
  }

  return (
    // TODO: Not sure why cursor='move' only works inline here vs defined in styled component
    <UnselectedCourseClass
      ref={drag}
      isDragging={isDragging}
      style={{ cursor: 'move', opacity }}
    >
      {`${course.courseCode} ${classData.activity}`}
    </UnselectedCourseClass>
  )
}

export default CourseClass
