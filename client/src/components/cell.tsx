import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'
import { CourseData, Period } from '../App'

export const weekdayToXCoordinate = (weekDay: string) => {
  const conversionTable: Record<string, number> = {
    'Mon': 0,
    'Tue': 1,
    'Wed': 2,
    'Thu': 3,
    'Fri': 4
  };
  return conversionTable[weekDay]
}

const StyledCell = styled.div<{ classTime: Period; canDrop: boolean }>`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => props.classTime.time.start + 1} /
    ${props => props.classTime.time.end + 1};
  border: 3px solid ${props => (props.canDrop ? 'green' : 'red')};
  background-color: white;
  ${props => !props.canDrop && 'display: none'};
`

interface CellProps {
  course: CourseData
  classTime: Period
  onDrop: (item: any) => void
}

const Cell: React.FC<CellProps> = ({ course, classTime, onDrop }) => {
  const [{ canDrop }, drop] = useDrop({
    accept: course.courseCode,
    drop: onDrop,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })
  return (
    <StyledCell ref={drop} classTime={classTime} canDrop={canDrop}>
      {course.courseCode}
    </StyledCell>
  )
}

export default Cell
