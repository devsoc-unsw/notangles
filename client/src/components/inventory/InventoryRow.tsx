import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'
import { CourseData } from '../../interfaces/CourseData'

import InventoryCourseClass from './InventoryCourseClass'
import { Box } from '@material-ui/core'

export interface InventoryRowProps {
  course: CourseData
  color: string
  selectedClassIds: string[]
  removeCourse(courseCode: string): void
  removeClass(activityId: string): void
}

const StyledInventoryRow = styled(Box)`
  display: flex;
  padding: 5px;
  border: 2px solid;
`

const RowCourseDescriptor = styled(Box)`
  width: 100px;
  /* margin-top: 20px; */
  padding: 10px;
  border-right: 3px solid;
`

const RowItems = styled.div<{ canDrop: boolean, color: string }>`
  /* ${props => props.canDrop && `border: 1px solid ${props.color}`} */
  width: 100%;
`

const InventoryRow: React.FC<InventoryRowProps> = ({
  course,
  removeCourse,
  selectedClassIds,
  color,
  removeClass
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
          color={color}
        />
      ))

    return res
  }

  const ids = Object.keys(course.classes).map(activity => `${course.courseCode}-${activity}`)

  const [{ canDrop }, drop] = useDrop({
    accept: ids,
    drop: ({ type }) => removeClass(type.toString()),
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })

  return (
    <StyledInventoryRow borderColor = 'secondary.main'>
      <RowCourseDescriptor borderColor = 'secondary.main'>
        <button
          onClick={() => {
            removeCourse(course.courseCode)
          }}
        >
          X
        </button>
        {`${course.courseCode}`}
      </RowCourseDescriptor>
      <RowItems ref={drop} canDrop={canDrop} color={color}>
        {getInventoryCourseClasses()}
      </RowItems>
    </StyledInventoryRow>
  )
}

export default InventoryRow
