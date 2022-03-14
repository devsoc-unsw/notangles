import React, { useContext } from 'react';
import { Box } from '@material-ui/core';
import styled from 'styled-components';

import { AppContext } from '../../AppContext';
import { contentPadding } from '../../constants/theme';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import { ClassData, ClassPeriod } from '../../interfaces/Course';
import { timetableWidth } from '../../utils/Drag';
import DroppedClasses, { inventoryMargin } from './DroppedClasses';
import Dropzones from './Dropzones';
import { TimetableLayout } from './TimetableLayout';

const StyledTimetable = styled(Box)<{
  rows: number;
}>`
  display: grid;
  min-width: ${timetableWidth}px;
  padding: ${contentPadding}px;
  box-sizing: content-box;
  user-select: none;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template:
    auto repeat(${({ rows }) => rows}, 1fr)
    / auto repeat(${days.length}, minmax(0, 1fr)) ${inventoryMargin}px minmax(0, 1fr);
`;

const StyledTimetableScroll = styled(Box)`
  padding: ${1 / devicePixelRatio}px;
  position: relative;
  left: -${contentPadding}px;
  width: calc(100% + ${contentPadding * 2 - (1 / devicePixelRatio) * 2}px);
  overflow-x: scroll;
  overflow-y: hidden;
`;

interface TimetableProps {
  assignedColors: Record<string, string>;
  clashes: Array<ClassPeriod>;
  handleSelectClass(classData: ClassData): void;
}

// beware memo - if a component isn't re-rendering, it could be why
const Timetable: React.FC<TimetableProps> = ({ assignedColors, clashes, handleSelectClass }) => {
  const { selectedCourses } = useContext(AppContext);

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable
        rows={
          Math.max(...selectedCourses.map((course) => course.latestFinishTime), defaultEndTime) -
          Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime)
        }
      >
        <TimetableLayout />
        <Dropzones assignedColors={assignedColors} />
        <DroppedClasses assignedColors={assignedColors} clashes={clashes} handleSelectClass={handleSelectClass} />
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default Timetable;
