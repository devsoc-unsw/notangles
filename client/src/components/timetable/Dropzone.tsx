import React from 'react'
import styled from 'styled-components'
import Card from '@material-ui/core/Card'
import { useDrop } from 'react-dnd'
import { Period } from '../../interfaces/CourseData'
import CardContent from '@material-ui/core/CardContent'

export const weekdayToXCoordinate = (weekDay: string) => {
  const conversionTable: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
  }
  return conversionTable[weekDay]
}

export const timeToIndex = (time: string) => {
  return Number(time.split(':')[0]) - 7
}

const StyledCell = styled(Card)<{
  classTime: Period
  canDrop: boolean
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  grid-column: ${props => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${props => timeToIndex(props.classTime.time.start)} /
    ${props => timeToIndex(props.classTime.time.end)};
  background-color: ${props => props.color};
  opacity: 0.5;

  font-size: 0.7rem;
  border-radius: 6px;
  padding: 6px;
  margin: 3px;
  position: relative;
  bottom: 1px;

  ${props => !props.canDrop && 'display: none'};
`

interface CellProps {
  courseCode: string
  activity: string
  classTime: Period
  color: string
  onDrop(): void
}

const Dropzone: React.FC<CellProps> = ({
  courseCode,
  activity,
  classTime,
  color,
  onDrop,
}) => {
  const [{ canDrop }, drop] = useDrop({
    accept: `${courseCode}-${activity}`,
    drop: onDrop,
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })

  return (
    <StyledCell
      ref={drop}
      classTime={classTime}
      canDrop={canDrop}
      color={color}
    />
  )
}

export { Dropzone }
