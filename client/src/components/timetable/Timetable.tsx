import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { CourseData } from '../../interfaces/CourseData'
import { days, hoursRange } from '../../constants/timetable'
import { TimetableLayout } from './TimetableLayout'
import { ClassDropzones } from './ClassDropzones'
import { DroppedClasses } from './DroppedClasses'
import * as theme from '../../constants/theme'

const rows: number = hoursRange[1] - hoursRange[0] + 2

const StyledTimetable = styled.div`
  display: grid;
  box-sizing: content-box;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: repeat(${rows}, calc(100% / ${rows})) / auto repeat(${days.length}, 1fr);
  border: 1px solid ${theme.border};
  border-radius: 6px;
  overflow: hidden;
`

const BorderTable = styled.table`
  border: 1px solid red;
  position: absolute;
  width: 100%;
  height: 100%;
`

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  onSelectClass(classId: string): void
}

const Timetable: FunctionComponent<TimetableProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
  is12HourMode,
  setIs12HourMode,
  onSelectClass
}) => {
  return (
    <StyledTimetable>
      <TimetableLayout
        days={days}
        hoursRange={hoursRange}
        is12HourMode={is12HourMode}
        setIs12HourMode={setIs12HourMode}
      />
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
