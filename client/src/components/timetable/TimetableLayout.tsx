import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

const BaseCell = styled.div<{ x: number; y: number }>`
  grid-column: ${props => props.x};
  grid-row: ${props => props.y};
  border: 0.2px solid rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Is12HourModeToggle = styled.span`
  color: #3a76f8;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: color 100ms;

  &:hover {
    color: #084cdd;
  }
`

interface TimetableLayoutProps {
  days: string[]
  hoursRange: number[]
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
}

const TimetableLayout: FunctionComponent<TimetableLayoutProps> = ({
  days,
  hoursRange,
  is12HourMode,
  setIs12HourMode
}) => {
  const hours: string[] = hourStrings(hoursRange, is12HourMode)

  const daysCells = days.map((day, i) => (
    <BaseCell key={day} x={i + 2} y={1}>
      {day}
    </BaseCell>
  ))

  const hoursCells = hours.map((hour, i) => (
    <BaseCell key={hour} x={1} y={i + 2}>
      {hour}
    </BaseCell>
  ))

  const otherCells = hours.map((_, y) =>
    days.map((_, x) =>
      <BaseCell key={x * 1000 + y} x={x + 2} y={y + 2} />)
  )

  return (
    <>
      <BaseCell key={0} x={1} y={1}>
        <Is12HourModeToggle onClick={() => setIs12HourMode(!is12HourMode)}>
          {`${is12HourMode ? '12' : '24'} h`}
        </Is12HourModeToggle>
      </BaseCell>
      {daysCells}
      {hoursCells}
      {otherCells}
    </>
  )
}

const hourStrings = (range: number[], is12HourMode: boolean): string[] => {
  const [min, max] = range

  // fill an array with numbers according to the range
  const hourNumbers: number[] = Array(max - min + 1).fill(0).map((_, i) => i + min)

  return hourNumbers.map(n => {
    if (is12HourMode) {
      const period = n < 12 ? 'AM' : 'PM'
      if (n > 12) n -= 12
      return `${n} ${period}`
    } else {
      return `${String(n).padStart(2, '0')}:00`
    }
  })
}

export { TimetableLayout }
