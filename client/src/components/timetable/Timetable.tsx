import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData } from '../../interfaces/CourseData';
import { days, hoursRange } from '../../constants/timetable';
import { TimetableLayout } from './TimetableLayout';
import { ClassDropzones } from './ClassDropzones';
import { DroppedClasses } from './DroppedClasses';

const rows: number = hoursRange[1] - hoursRange[0] + 1;

const StyledTimetable = styled(Box)`
  display: grid;
  min-height: 700px;
  max-height: 900px;
  margin-bottom: 20px;
  box-sizing: content-box;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${rows}, 1fr) / auto repeat(${days.length}, 1fr);
  border: 1px solid ${(props) => props.theme.palette.secondary.main};
  border-radius: 6px;
  overflow: hidden;
`;

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
  onSelectClass,
}) => (
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
);

export { Timetable };
