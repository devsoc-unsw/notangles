import React, { FunctionComponent } from 'react'
import { useDrag } from 'react-dnd'
import styled from 'styled-components'
import { CourseData, Period, ClassData, ClassTime } from '../../interfaces/CourseData'
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
  font-size: 0.7rem;
`

interface DroppedClassProps {
  activity: string
  courseCode: string
  color: string
  classTime: Period
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
  classTime,
}) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: `${courseCode}-${activity}` },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <StyledCourseClass
      ref={drag}
      isDragging={isDragging}
      backgroundColor={color}
      color={bgAndTextColorPairs[color]}
      classTime={classTime}
    >
      <p style={{ textAlign: 'center', marginBottom: 0 }}>{`${courseCode} ${activity === 'Lecture' ? 'LEC' : 'TUTE-LAB'}`}</p>
      <p style={{ textAlign: 'center', marginTop: 0 }}>{`${classTime.location}`}</p>
    </StyledCourseClass>
  )
}

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
}

const buildDroppedClass = ({
  classData,
  classTime,
  course,
  assignedColors
}: {
  classData: ClassData,
  classTime: Period,
  course: CourseData,
  assignedColors: Record<string, string>
}): JSX.Element => (
    <DroppedClass
      key={`${classData.classId}-${JSON.stringify(classTime)}`}
      activity={classData.activity}
      courseCode={course.courseCode}
      color={assignedColors[course.courseCode]}
      classTime={classTime}
    />
  )

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = []

  selectedCourses.forEach(course => {
    const allClasses = Object.values(course.classes).flatMap(x => x)
    allClasses.filter(classData => selectedClassIds.includes(classData.classId)).forEach(classData => {
      classData.periods.forEach(classTime => {
        droppedClasses.push(
          buildDroppedClass({
            classData,
            classTime,
            course,
            assignedColors
          })
        )
      })
    })
  })

  return <>{droppedClasses}</>
}

export { DroppedClasses }
