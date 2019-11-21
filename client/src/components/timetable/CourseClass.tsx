import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { ClassData, CourseData, Period } from '../../interfaces/CourseData'
import { timeToIndex, weekdayToXCoordinate } from '../timetable/Dropzone'

export interface CourseClassProps {
  course: CourseData
  classData: ClassData
  period: Period
  colour?: string
}

// interface UnselectedCourseClassProps {
//   isDragging: boolean
// }

// const UnselectedCourseClass = styled.div`
//   height: 100%;
//   width: 100%;
//   color: white;

//   background-color: orange;
  // opacity: ${(props: UnselectedCourseClassProps) =>
  //   props.isDragging ? 0.5 : 1};

//   cursor: move;
// `

const StyledCourseClass = styled.div<{
  classTime: Period,
  isDragging: boolean
}>`
  height: 100%;
  width: 100%;
  color: white;
  cursor: move;
  background-color: orange;
  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => timeToIndex(props.classTime.time.start)} /
    ${props => timeToIndex(props.classTime.time.end)};
  opacity: ${props => props.isDragging ? 0.5 : 1};
`

const CourseClass: React.FC<CourseClassProps> = ({
  course,
  classData,
  colour,
  period
}) => {
  const bgAndTextColorPairs: Record<string, string> = {
    violet: 'white',
    indigo: 'white',
    green: 'white',
    blue: 'white',
    yellow: 'black',
    orange: 'black',
    red: 'black',
  }
  const [{ isDragging, opacity }, drag] = useDrag({
    item: { type: classData.classId },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  if (!colour) {
    colour = 'orange'
  }

  return (
    <StyledCourseClass
      ref={drag}
      isDragging={isDragging}
      style={{
        cursor: 'move',
        backgroundColor: colour,
        color: bgAndTextColorPairs[colour],
      }}
      classTime={period}
    >
      {`${course.courseCode} ${classData.activity}`}
    </StyledCourseClass>
  )
  // return (
  //   <UnselectedCourseClass
  //     ref={drag}
  //     isDragging={isDragging}
  //     style={{
  //       cursor: 'move',
  //       opacity,
  //       backgroundColor: colour,
  //       color: bgAndTextColorPairs[colour],
  //     }}
  //   >
  //     {`${course.courseCode} ${classData.activity}`}
  //   </UnselectedCourseClass>
  // )
}

export default CourseClass
