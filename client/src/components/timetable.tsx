import React from 'react'
import Cell from './cell'
import styled from 'styled-components'

const StyledTimetable = styled.div`
  display: grid;
  grid-template: auto / repeat(6, 1fr);

  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`

const StyledHours = styled(Cell)<{ startPos: number }>`
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
