import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData } from '../../interfaces/CourseData';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses from './DroppedClasses';

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  min-height: ${(props) => props.rows * 35}px;
  max-height: ${(props) => props.rows * 45}px;
  margin-bottom: 20px;
  box-sizing: content-box;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  overflow: hidden;

  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${(props) => props.rows}, 1fr) / auto repeat(${days.length}, 1fr);
  border: 1px solid ${(props) => props.theme.palette.secondary.main};
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
  <StyledTimetable
    rows={2 * (Math.max(...selectedCourses.map(
      (course) => course.latestClassFinishTime,
    ), defaultEndTime) - defaultStartTime + 1)}
  >
    <TimetableLayout
      days={days}
      is12HourMode={is12HourMode}
      setIs12HourMode={setIs12HourMode}
      selectedCourses={selectedCourses}
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

export default Timetable;
