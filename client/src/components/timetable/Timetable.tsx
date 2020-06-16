import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, ClassData } from '../../interfaces/CourseData';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses from './DroppedClasses';

const rowHeight = 100;

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  min-height: ${(props) => props.rows * rowHeight}px;
  max-height: ${(props) => props.rows * rowHeight}px; // TODO: should be different to min-height
  margin-top: 15px;
  margin-bottom: 15px;
  box-sizing: content-box;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  overflow: hidden;

  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${(props) => 2 * props.rows}, 1fr) / auto repeat(${days.length}, 1fr);
  border: 1px solid ${(props) => props.theme.palette.secondary.main};
`;

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  onSelectClass(classData: ClassData): void
}

const Timetable: FunctionComponent<TimetableProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  is12HourMode,
  setIs12HourMode,
  onSelectClass,
}) => (
  <StyledTimetable
    rows={Math.max(...selectedCourses.map(
      (course) => course.latestClassFinishTime,
    ), defaultEndTime) - defaultStartTime}
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
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
    />
  </StyledTimetable>
);

export default Timetable;
