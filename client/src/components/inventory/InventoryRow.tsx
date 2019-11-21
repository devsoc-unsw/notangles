import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'
import { CourseData } from '../../interfaces/CourseData'

import InventoryCourseClass from './InventoryCourseClass'

export interface InventoryRowProps {
  course: CourseData
  color: string
  selectedClassIds: string[]
  removeCourse(courseCode: string): void
}

const StyledInventoryRow = styled.div`
  display: flex;
  padding: 5px;
  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const RowCourseDescriptor = styled.div`
  width: 100px;
  /* margin-top: 20px; */
  padding: 10px;
  border-right: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const RowItems = styled.div<{ canDrop: boolean }>`
  ${props => props.canDrop && 'border: 2px solid red;'}
`

const InventoryRow: React.FC<InventoryRowProps> = ({
  course,
  removeCourse,
  selectedClassIds,
  color,
}) => {
  const getInventoryCourseClasses = (): React.ReactNode[] => {
    // return course classes for activities which don't currently have a selected class
    const res = Object.entries(course.classes)
      .filter(
        ([_, activityClasses]) =>
          !activityClasses.some(classData =>
            selectedClassIds.includes(classData.classId)
          )
      )
      .map(([activity]) => (
        <InventoryCourseClass
          key={`${course.courseCode}-${activity}`}
          courseCode={course.courseCode}
          activity={activity}
          colour={color}
        />
      ))

    return res
  }

  const getAllIds = (): string[] => {
    const res: string[] = []

    for (let activity in course.classes) {
      res.push(...course.classes[activity].map(classData => classData.classId))
    }
    return res
  }

  const [{ canDrop }, drop] = useDrop({
    accept: getAllIds(),
    drop: console.log,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })

  return (
    <StyledInventoryRow>
      <RowCourseDescriptor>
        <button
          onClick={() => {
            removeCourse(course.courseCode)
          }}
        >
          X
        </button>
        {`${course.courseCode}`}
      </RowCourseDescriptor>
      <RowItems ref={drop} canDrop={canDrop}>
        {getInventoryCourseClasses()}
      </RowItems>
    </StyledInventoryRow>
  )
}

export default InventoryRow
