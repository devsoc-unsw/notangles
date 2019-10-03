import React from 'react'
import Cell from './cell'
import styled from 'styled-components'

const StyledTimetable = styled.div`
  display: grid;
  grid-template: repeat(20, 1fr) / repeat(6, 1fr);
  border: 1px solid;
  box-sizing: border-box;
`

const StyledHours = styled(Cell)<{ startPos: number }>`
  grid-column-start: ${props => props.startPos};
`

const Timetable: React.FC = () => {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <StyledTimetable>
      <Cell />
      {days.map(day => (
        <Cell>{day}</Cell>
      ))}
      {hours.map((hour, i) => (
        <>
          <StyledHours startPos={i}>{hour}</StyledHours>
          {days.map(day => (
            <Cell></Cell>
          ))}
        </>
      ))}
    </StyledTimetable>
  )
}
export default Timetable
