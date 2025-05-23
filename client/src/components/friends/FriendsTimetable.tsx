import { Box } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useState } from 'react';

import { contentPadding, inventoryMargin } from '../../constants/theme';
import { timetableWidth } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { EventPeriod } from '../../interfaces/Periods';
import ActivityBar from './ActivityBar';

const StyledTimetable = styled(Box, {
  shouldForwardProp: (prop) => !['rows', 'cols'].includes(prop.toString()),
})<{
  rows: number;
  cols: number;
}>`
  display: grid;
  min-width: ${timetableWidth}px;
  padding: 0px ${contentPadding}px ${contentPadding}px ${contentPadding}px;
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

const TimetableContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`;

const Timetable = styled('div')`
  display: flex;
  flex-direction: row;
  width: 1000px;
  height: 100%;
`;

const FriendsTimetable: React.FC = () => {
  const { days, earliestStartTime, latestEndTime } = useContext(AppContext);
  const [copiedEvent, setCopiedEvent] = useState<EventPeriod | null>(null);

  // Calculate the correct number of rows, accounting for when the earliest start time is later than latest end time.
  // E.g. starting at 7pm and ending at 4am.
  const numRows =
    latestEndTime > earliestStartTime ? latestEndTime - earliestStartTime : 24 - earliestStartTime + latestEndTime;

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable cols={days.length} rows={numRows}>
        <TimetableContainer>
          <Timetable></Timetable>
          {/* <TimetableLayout copiedEvent={copiedEvent} setCopiedEvent={setCopiedEvent} /> */}
          <ActivityBar />
        </TimetableContainer>
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default FriendsTimetable;
