import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'
import { ClassData, CourseData, Period } from '../App'

export const weekdayToXCoordinate = (weekDay: string) => {
  const conversionTable: Record<string, number> = {
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5
  };
  return conversionTable[weekDay]
}

export const timeToIndex = (time: string) => {
  return Number.parseInt(time.split(':')[0]) - 7
}

const StyledCell = styled.div<{ classTime: Period; canDrop: boolean }>`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => timeToIndex(props.classTime.time.start)} /
    ${props => timeToIndex(props.classTime.time.end)};
  border: 3px solid ${props => (props.canDrop ? 'green' : 'red')};
  background-color: white;
  ${props => !props.canDrop && 'display: none'};
`

interface CellProps {
  course: CourseData
  classTime: Period
  onDrop: (item: any) => void
  classData: ClassData
}

const Cell: React.FC<CellProps> = ({ course, classTime, onDrop, classData }) => {
  const [{ canDrop }, drop] = useDrop({
    accept: `${course.courseCode} ${classData.activity}`,
    drop: onDrop,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })
  return (
    <StyledCell ref={drop} classTime={classTime} canDrop={canDrop}>
      {`${course.courseCode} ${classData.activity}`}
    </StyledCell>
  )
}

export default Cell
