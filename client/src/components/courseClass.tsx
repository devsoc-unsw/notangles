import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { ItemTypes } from './constants'

export interface Course {
  id: string
  classes: ClassTime[]
}

// [day, from, to]
export type ClassTime = [number, number, number]

export interface CourseClassProps {
  course: Course
  classTime?: ClassTime
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
  classTime: ClassTime
}>`
  grid-column: ${props => props.classTime[0]};
  grid-row: ${props => props.classTime[1]} / ${props => props.classTime[2]};
`

const CourseClass: React.FC<CourseClassProps> = ({ course, classTime }) => {
  const [{ isDragging, opacity }, drag] = useDrag({
    item: { type: ItemTypes.COURSECLASS },
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
      style={{ cursor: 'move' }}
    >
      {course.id}
    </UnselectedCourseClass>
  )
}

export default CourseClass
