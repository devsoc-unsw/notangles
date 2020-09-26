import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, ClassData, SelectedClasses } from '../../interfaces/CourseData';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses from './DroppedClasses';
import Inventory from '../inventory/Inventory';

const rowHeight = 86;

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  min-height: ${({ rows }) => rows * rowHeight}px;
  max-height: ${({ rows }) => rows * rowHeight}px; // TODO: should be different to min-height
  margin-top: 15px;
  box-sizing: content-box;
  user-select: none;

  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${({ rows }) => rows}, 1fr) / auto repeat(${days.length}, minmax(0, 1fr)) 1fr;
`;

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClasses: SelectedClasses
  assignedColors: Record<string, string>
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
}

const Timetable: FunctionComponent<TimetableProps> = React.memo(({
  selectedCourses,
  selectedClasses,
  assignedColors,
  is12HourMode,
  setIs12HourMode,
}) => (
  <StyledTimetable
    rows={Math.max(...selectedCourses.map(
      (course) => course.latestFinishTime,
    ), defaultEndTime) - defaultStartTime}
  >
    <Inventory
      key={selectedCourses.map((course) => course.code).join(',')}
      selectedCourses={selectedCourses}
      assignedColors={assignedColors}
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
    />
    <DroppedClasses
      days={days}
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
    />
  </StyledTimetable>
), (prev, next) => !(
  prev.is12HourMode !== next.is12HourMode
  || prev.selectedClasses !== next.selectedClasses
  || prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default Timetable;
