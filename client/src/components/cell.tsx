import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'

import { ItemTypes } from './constants'
import { Course, ClassTime } from './timetable'

const StyledCell = styled.div<{ classTime: ClassTime; canDrop: boolean }>`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  grid-column: ${props => props.classTime[0] + 1};
  grid-row: ${props => props.classTime[1] + 1} /
    ${props => props.classTime[2] + 1};
  border: 3px solid ${props => (props.canDrop ? 'green' : 'red')};
  background-color: white;
  ${props => !props.canDrop && 'display: none'};
`

interface CellProps {
  course: Course
  classTime: ClassTime
  onDrop: (item: any) => void
}

const Cell: React.FC<CellProps> = ({ course, classTime, onDrop }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: course.id,
    drop: onDrop,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })
  return (
    <StyledCell ref={drop} classTime={classTime} canDrop={canDrop}>
      {course.id}
    </StyledCell>
  )
}

export default Cell
