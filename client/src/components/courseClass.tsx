import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { ClassData, CourseData, Period } from '../App'
import { weekdayToXCoordinate } from './cell'

export interface CourseClassProps {
  course: CourseData
  classTime?: ClassData
  classData: ClassData
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
  grid-row: ${props => props.classTime.time.start + 1} /
    ${props => props.classTime.time.end + 1};
`

const CourseClass: React.FC<CourseClassProps> = ({ course, classTime, classData }) => {
  const [{ isDragging, opacity }, drag] = useDrag({
    item: { type: course.courseCode },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  if (classTime) {
    return (
      <div>
        {classTime.periods.map(period => (
          <StyledCourseClass
            ref={drag}
            isDragging={isDragging}
            style={{ cursor: 'move' }}
            classTime={period}
          >
            {`${course.courseCode} ${classData.activity}`}
          </StyledCourseClass>
        ))}
      </div>
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
