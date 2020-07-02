import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, ClassData } from '../../interfaces/CourseData';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses from './DroppedClasses';
import Inventory from '../inventory/Inventory';

const rowHeight = 85;

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  min-height: ${(props) => props.rows * rowHeight}px;
  max-height: ${(props) => props.rows * rowHeight}px; // TODO: should be different to min-height
  margin-top: 15px;
  box-sizing: content-box;

  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: repeat(${(props) => 2 * props.rows + 1}, 1fr) auto / auto repeat(${days.length}, 1fr) 11px 1fr;
`;

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  onSelectClass(classData: ClassData): void
  onRemoveClass(classData: ClassData): void
}

const Timetable: FunctionComponent<TimetableProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  is12HourMode,
  setIs12HourMode,
  onSelectClass,
  onRemoveClass,
}) => (
  <StyledTimetable
    rows={Math.max(...selectedCourses.map(
      (course) => course.latestFinishTime,
    ), defaultEndTime) - defaultStartTime}
  >
    <Inventory
      key={selectedCourses.map((course) => course.code).join(',')}
      selectedCourses={selectedCourses}
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
      removeClass={onRemoveClass}
    />
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
