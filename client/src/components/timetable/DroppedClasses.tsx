import React, { FunctionComponent } from 'react'
import { useDrag } from 'react-dnd'
import styled from 'styled-components'
import { CourseData, Period } from '../../interfaces/CourseData'
import { weekdayToXCoordinate, timeToIndex } from './Dropzone'

const StyledCourseClass = styled.div<{
  isDragging: boolean
  classTime: Period
  backgroundColor: string
  color: string
}>`
  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => timeToIndex(props.classTime.time.start)} /
    ${props => timeToIndex(props.classTime.time.end)};
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  opacity: ${props => (props.isDragging ? 0.5 : 1)};
  cursor: move;
`

interface DroppedClassProps {
  activity: string
  courseCode: string
  color: string
  classTimes: Period[]
}

const bgAndTextColorPairs: Record<string, string> = {
  violet: 'white',
  indigo: 'white',
  green: 'white',
  blue: 'white',
  yellow: 'black',
  orange: 'black',
  red: 'black',
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  activity,
  courseCode,
  color,
  classTimes,
}) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: `${courseCode}-${activity}` },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const classes = classTimes.map(classTime => (
    <StyledCourseClass
      ref={drag}
      isDragging={isDragging}
      backgroundColor={color}
      color={bgAndTextColorPairs[color]}
      classTime={classTime}
    >
      {`${courseCode} ${activity}`}
    </StyledCourseClass>
  ))

  return <>{classes}</>
}

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = []
  for (const course of selectedCourses) {
    const allClasses = Object.values(course.classes).flatMap(x => x)
    for (const classData of allClasses) {
      if (selectedClassIds.includes(classData.classId)) {
        droppedClasses.push(
          <DroppedClass
            activity={classData.activity}
            courseCode={course.courseCode}
            color={assignedColors[course.courseCode]}
            classTimes={classData.periods}
          />
        )
      }
    }
  }
  return <>{droppedClasses}</>
}

export { DroppedClasses }
