import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

const BaseCell = styled.div<{ x: number; y: number }>`
  grid-column: ${props => props.x};
  grid-row: ${props => props.y};
  border: 0.2px solid rgba(0, 0, 0, 0.2);
`

interface TimetableLayoutProps {
  days: string[]
  hours: string[]
}

const TimetableLayout: FunctionComponent<TimetableLayoutProps> = ({
  days,
  hours,
}) => {
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
    days.map((_, x) => <BaseCell key={x * 1000 + y} x={x + 2} y={y + 2} />)
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
