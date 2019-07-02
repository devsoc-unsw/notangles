import React from 'react'
import './timetable.css'

function TimeTable() {
  const timeframes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return (
    <div className="timetable-canvas">
      <div className="timetable">
        {timeframes.map(timeframe => (
          <div className="cells-row">
            <div className="timeframe">{timeframe}</div>
            {days.map(day => (
              <div className="cell">{day}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
export  { TimeTable }
