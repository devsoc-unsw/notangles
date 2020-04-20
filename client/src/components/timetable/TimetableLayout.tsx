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

interface TimetableLayoutProps {
  days: string[]
  hoursRange: number[]
  twelveHourMode: boolean
}

const TimetableLayout: FunctionComponent<TimetableLayoutProps> = ({
  days,
  hoursRange,
  twelveHourMode,
}) => {
  // fill an array with numbers as specified by hoursRange
  const [min, max] = hoursRange
  const hourNumbers: number[] = Array(max - min + 1).fill(0).map((_, i) => i + min)
  const hours: string[] = hourNumbers.map(n => {
    if (twelveHourMode) {
      let period: string = "AM"
      if (n > 12) {
        n -= 12
        period = "PM"
      }
      return n + " " + period
    } else {
      let hour: string = String(n)
      if (hour.length == 1) {
        hour = "0" + hour
      }
      return hour + ":00"
    }
  })

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
      <BaseCell key={0} x={1} y={1} />
      {daysCells}
      {hoursCells}
      {otherCells}
    </>
  )
}

export { TimetableLayout }
