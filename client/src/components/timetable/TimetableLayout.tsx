import React, { useContext } from 'react';
import { styled } from '@mui/system';

import { getDefaultStartTime, getDefaultEndTime } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { unknownErrorMessage } from '../../constants/timetable'

export const rowHeight = 60;
const classMargin = 1;
const headerPadding = 10;

export const getClassMargin = (isSquareEdges: boolean) => (isSquareEdges ? 0 : classMargin);

const BaseCell = styled('div', {
  shouldForwardProp: (prop) => !['x', 'y', 'yTo', 'isEndX', 'isEndY'].includes(prop.toString()),
})<{
  x: number;
  y: number;
  yTo?: number;
  isEndX?: boolean;
  isEndY?: boolean;
}>`
  grid-column: ${({ x }) => x};
  grid-row: ${({ y }) => y} / ${({ y, yTo }) => yTo || y};
  background: ${({ theme }) => theme.palette.background.default};
  z-index: 10;
  transition: background 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: solid ${({ theme }) => theme.palette.secondary.main} 1px;
  outline-offset: -0.5px;

  border-top-left-radius: ${({ theme, x, y }) => (x === 1 && y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-left-radius: ${({ theme, x, isEndY }) => (x === 1 && isEndY ? theme.shape.borderRadius : 0)}px;
  border-top-right-radius: ${({ theme, isEndX, y }) => (isEndX && y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-right-radius: ${({ theme, isEndX, isEndY }) => (isEndX && isEndY ? theme.shape.borderRadius : 0)}px;
`;

const GridCell = styled(BaseCell)`
  height: ${rowHeight}px;
`;

const DayCell = styled(BaseCell)`
  padding: ${headerPadding}px 0;
`;

const InventoryCell = styled(DayCell)`
  border-top-left-radius: ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-top-right-radius: ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-left-radius: ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-right-radius: ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
`;

const HourCell = styled(GridCell, {
  shouldForwardProp: (prop) => prop !== 'is12HourMode',
})<{ is12HourMode: boolean }>`
  padding: 0 ${headerPadding}px;
  display: grid;
  justify-content: ${({ is12HourMode }) => (is12HourMode ? 'end' : 'center')};
`;

const ToggleCell = styled(BaseCell)`
  padding: 0 ${headerPadding}px;
  display: grid;
  justify-content: center;

  & span {
    grid-column: 1;
    grid-row: 1;
  }
`;

const ColumnWidthGuide = styled('span')`
  opacity: 0;
  pointer-events: none;
`;

const generateHour = (n: number, is12HourMode: boolean): string => {
  // Convert the hour to be in the 24 hrs range.
  n = ((n % 24) + 24) % 24;
  if (is12HourMode) {
    const period = n < 12 ? 'am' : 'pm';
    if (n === 0) n = 12;
    if (n > 12) n -= 12;
    return `${n} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

const generateHours = (range: number[], is12HourMode: boolean, isConvertToLocalTimezone: boolean): string[] => {
  const { setErrorVisibility, setAlertMsg } = useContext(AppContext);
  const [min, max] = range;

  // console.log('min', min);
  // console.log('max', max);

  // Fill an array with hour strings according to the range
  try {
    if (min < max) {
      return Array(max - min + 1)
      .fill(0)
      .map((_, i) => generateHour(i + min, is12HourMode));
    } else {
      return Array(24)
      .fill(0)
      .map((_, i) => generateHour(i + 0, is12HourMode));
    }
  } catch(err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);

    const defaultStartTime = getDefaultStartTime(isConvertToLocalTimezone);
    const defaultEndTime = getDefaultEndTime(isConvertToLocalTimezone);

    if (defaultStartTime < defaultEndTime) {
      return Array(defaultEndTime - defaultStartTime + 1)
      .fill(0)
      .map((_, i) => generateHour(i + defaultStartTime, is12HourMode));
    } else {
      return Array(24)
      .fill(0)
      .map((_, i) => generateHour(i + 0, is12HourMode));
    }
  }
};

export const TimetableLayout: React.FC = () => {
  
  const { is12HourMode, days, earliestStartTime, latestEndTime, isConvertToLocalTimezone } = useContext(AppContext);

  const hoursRange = [
    Math.floor(Math.min(earliestStartTime, getDefaultStartTime(isConvertToLocalTimezone))),
    Math.ceil(Math.max(latestEndTime, getDefaultEndTime(isConvertToLocalTimezone)) - 1),
  ];
  const hours: string[] = generateHours(hoursRange, is12HourMode, isConvertToLocalTimezone);

  const dayCells = days.map((day, i) => (
    <DayCell key={day} x={i + 2} y={1} isEndX={i === days.length - 1}>
      {day}
    </DayCell>
  ));

  dayCells.push(
    <InventoryCell key="unscheduled" x={days.length + 3} y={1} isEndX>
      Unscheduled
    </InventoryCell>
  );

  const hourCells = hours.map((hour, i) => (
    <HourCell key={hour} x={1} y={i + 2} is12HourMode={is12HourMode} isEndY={i === hours.length - 1}>
      {hour}
    </HourCell>
  ));

  const otherCells = hours.flatMap((_, y) =>
    days.flatMap((_, x) => (
      <GridCell
        key={x * 1000 + y}
        x={x + 2}
        y={y + 2}
        isEndX={x === days.length - 1}
        isEndY={y === hours.length - 1}
        id={x === 0 && y === 0 ? 'origin' : undefined}
      />
    ))
  );

  otherCells.push(<InventoryCell key={-1} x={days.length + 3} y={2} yTo={-1} isEndX isEndY />);

  return (
    <>
      <ToggleCell key={0} x={1} y={1}>
        {
          // Invisible guide for the column width for
          // consistency between 24 and 12 hour time.
          // Content is something like '10 AM'.
        }
        <ColumnWidthGuide>{generateHour(10, true)}</ColumnWidthGuide>
      </ToggleCell>
      {dayCells}
      {hourCells}
      {otherCells}
    </>
  );
};
