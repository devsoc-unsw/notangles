import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { Course, ClassTime } from './timetable'

export interface CourseClassProps {
  course: Course
  classTime?: ClassTime
  colour?: string
}

interface UnselectedCourseClassProps {
  isDragging: boolean
}

const UnselectedCourseClass = styled.div`
  height: 100%;
  width: 100%;
  color: white;

  background-color: orange;
  opacity: ${(props: UnselectedCourseClassProps) =>
    props.isDragging ? 0.5 : 1};

  cursor: move;
`

const StyledCourseClass = styled(UnselectedCourseClass)<{
  classTime: ClassTime
}>`
  grid-column: ${props => props.classTime[0] + 1};
  grid-row: ${props => props.classTime[1] + 1} /
    ${props => props.classTime[2] + 1};
`

const CourseClass: React.FC<CourseClassProps> = ({
  course,
  classTime,
  colour,
}) => {
  const [{ isDragging, opacity }, drag] = useDrag({
    item: { type: course.id },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  if (classTime) {
    return (
      <StyledCourseClass
        ref={drag}
        isDragging={isDragging}
        style={{ cursor: 'move' }}
        classTime={classTime}
      >
        {course.id}
      </StyledCourseClass>
    )
  }

  return (
    // TODO: Not sure why cursor='move' only works inline here vs defined in styled component
    <UnselectedCourseClass
      ref={drag}
      isDragging={isDragging}
      style={{ cursor: 'move', opacity, backgroundColor: colour }}
    >
      {course.id}
    </UnselectedCourseClass>
  )
}

export default CourseClass
