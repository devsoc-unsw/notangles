import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'styled-components'

import Cell from './cell'
import CourseClass from './courseClass'

const StyledTimetable = styled.div`
  display: grid;
  grid-template: auto / repeat(6, 1fr);

  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`

const StyledHour = styled(Cell)<{ startPos: number }>`
  grid-column-start: ${props => props.startPos};
`

const Timetable: React.FC = () => {
  const hours = [
    '9:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const renderCell = (text?: string) => {
    return <Cell>{text}</Cell>
  }
  const renderStyledHour = (text: string, gridColumnStart: number) => {
    return <StyledHour startPos={gridColumnStart}>{text}</StyledHour>
  }

  /* Constructing the timetable grid of cells */
  const cellsGrid: JSX.Element[][] = []
  const daysRow: JSX.Element[] = [renderCell()]
  days.forEach(day => daysRow.push(renderCell(day)))
  cellsGrid.push(daysRow)
  hours.forEach((hour, i) => {
    const hoursRow: JSX.Element[] = []
    hoursRow.push(renderStyledHour(hour, i))
    days.forEach(_ => hoursRow.push(renderCell()))
    cellsGrid.push(hoursRow)
  })

  return (
    <DndProvider backend={HTML5Backend}>
      <StyledTimetable>{cellsGrid}</StyledTimetable>
    </DndProvider>
  )
}
export default Timetable
