import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

import { contentPadding, inventoryMargin } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import { timetableWidth } from '../../utils/Drag';

import DroppedCards from './DroppedCards';
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
  grid-gap: 1px;
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

const Timetable: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  const { days, earliestStartTime, latestEndTime } = useContext(AppContext);

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable cols={days.length} rows={latestEndTime - earliestStartTime}>
        <TimetableLayout />
        <Dropzones assignedColors={assignedColors} />
        <DroppedCards assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
        {/* <DroppedClasses assignedColors={assignedColors} handleSelectClass={handleSelectClass} /> */}
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default Timetable;
