import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { CourseData } from '../../interfaces/CourseData'
import { days, hoursRange } from '../../constants/timetable'
import { TimetableLayout } from './TimetableLayout'
import { ClassDropzones } from './ClassDropzones'
import { DroppedClasses } from './DroppedClasses'

const StyledTimetable = styled.div`
  display: grid;
  grid-template: auto / repeat(6, 1fr);

  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
  onSelectClass(classId: string): void
  twelveHourMode: boolean
}

const Timetable: FunctionComponent<TimetableProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
  onSelectClass,
  twelveHourMode,
}) => {
  return (
    <StyledTimetable>
      <TimetableLayout days={days} hoursRange={hoursRange} twelveHourMode={twelveHourMode} />
      <ClassDropzones
        selectedCourses={selectedCourses}
        assignedColors={assignedColors}
        onSelectClass={onSelectClass}
      />
      <DroppedClasses
        selectedCourses={selectedCourses}
        selectedClassIds={selectedClassIds}
        assignedColors={assignedColors}
      />
    </StyledTimetable>
  )
}

export { Timetable }
