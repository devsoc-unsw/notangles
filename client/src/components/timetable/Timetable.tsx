import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

import { contentPadding } from '../../constants/theme';
import { defaultEndTime, defaultStartTime } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { AppContext } from '../../context/AppContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import { timetableWidth } from '../../utils/Drag';

import DroppedClasses, { inventoryMargin } from './DroppedClasses';
import Dropzones from './Dropzones';
import { TimetableLayout } from './TimetableLayout';

const StyledTimetable = styled(Box, {
  shouldForwardProp: (prop) => !['rows', 'cols'].includes(prop.toString()),
})<{
  rows: number;
  cols: number;
}>`
  display: grid;
  min-width: ${timetableWidth}px;
  padding: ${contentPadding}px;
  box-sizing: content-box;
  user-select: none;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template:
    auto repeat(${({ rows }) => rows}, 1fr)
    / auto repeat(${({ cols }) => cols}, minmax(0, 1fr)) ${inventoryMargin}px minmax(0, 1fr);
`;

const StyledTimetableScroll = styled(Box)`
  padding: ${1 / devicePixelRatio}px;
  position: relative;
  left: -${contentPadding}px;
  width: calc(100% + ${contentPadding * 2 - (1 / devicePixelRatio) * 2}px);
  overflow-x: none;
  overflow-y: hidden;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    overflow-x: scroll;
  }
`;

const Timetable: React.FC<TimetableProps> = ({ assignedColors, clashes, handleSelectClass }) => {
  const { selectedCourses } = useContext(CourseContext);
  const { days } = useContext(AppContext);

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable
        cols={days.length}
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
