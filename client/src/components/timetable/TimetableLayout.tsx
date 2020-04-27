import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import * as theme from '../../constants/theme'

const BaseCell = styled.div<{ x: number; y: number }>`
  grid-column: ${props => props.x};
  grid-row: ${props => props.y};
  // border: 1px solid red;
  box-shadow: 0 0 0 ${1 / devicePixelRatio}px ${theme.border};

  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const HourCell = styled(BaseCell)`
  padding: 0 25px 0 25px;
  display: grid;
  justify-content: end;

  & span {
    grid-column: 1;
    grid-row: 1;
  }
`

const Is12HourModeToggle = styled.span`
  color: ${theme.primary};
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: color 100ms;

  &:hover {
    color: ${theme.primaryDark};
  }
`

const ColumnWidthGuide = styled.span`
  opacity: 0;
  pointer-events: none;
`

const generateHours = (range: number[], is12HourMode: boolean): string[] => {
  const [min, max] = range
  // Fill an array with hour strings according to the range
  return Array(max - min + 1).fill(0).map((_, i) => generateHour(i + min, is12HourMode))
}

const generateHour = (n: number, is12HourMode: boolean): string => {
  if (is12HourMode) {
    const period = n < 12 ? 'AM' : 'PM'
    if (n > 12) n -= 12
    return `${n} ${period}`
  } else {
    return `${String(n).padStart(2, '0')}:00`
  }
}

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
  const hours: string[] = generateHours(hoursRange, is12HourMode)

  const dayCells = days.map((day, i) => (
    <BaseCell key={day} x={i + 2} y={1}>
      {day}
    </BaseCell>
  ))

  const hourCells = hours.map((hour, i) => (
    <HourCell key={hour} x={1} y={i + 2} style={{justifyContent: is12HourMode ? 'end' : 'center'}}>
      {hour}
    </HourCell>
  ))

  const otherCells = hours.map((_, y) =>
    days.map((_, x) =>
      <BaseCell key={x * 1000 + y} x={x + 2} y={y + 2} />)
  )

  return (
    <>
      <HourCell key={0} x={1} y={1} style={{justifyContent: 'center'}}>
        <Is12HourModeToggle onClick={() => setIs12HourMode(!is12HourMode)}>
          {`${is12HourMode ? '12' : '24'} h`}
        </Is12HourModeToggle>
        {
          // Invisible guide for the column width for
          // consistency between 24 and 12 hour time.
          // Content is something like '10 AM'.
        }
        <ColumnWidthGuide>{generateHour(10, true)}</ColumnWidthGuide>
      </HourCell>
      {dayCells}
      {hourCells}
      {otherCells}
    </>
  )
}

export { TimetableLayout }
