import React, { useContext } from 'react';
import { styled } from '@mui/system';
import {
  classMargin,
  defaultEndTime,
  defaultStartTime,
  headerPadding,
  rowHeight,
  unknownErrorMessage,
} from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';

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

/**
 * @param n The numerical value of the hour
 * @param is12HourMode Whether 12-hour mode is set
 * @returns The hour in 12-hour am|pm format or 24-hour hh:mm format
 */
const generateHour = (n: number, is12HourMode: boolean): string => {
  if (is12HourMode) {
    const period = n < 12 ? 'am' : 'pm';
    if (n > 12) n -= 12;
    return `${n} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

/**
 * @param range The range of hours to generate
 * @param is12HourMode Whether 12-hour mode is set
 * @returns An array of hour strings
 */
const generateHours = (
  range: number[],
  is12HourMode: boolean,
  setAlertMsg: (newErrorMsg: string) => void,
  setErrorVisibility: (newVisibility: boolean) => void
): string[] => {
  const [min, max] = range;

  try {
    return Array(max - min + 1)
      .fill(0)
      .map((_, i) => generateHour(i + min, is12HourMode));
  } catch (err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);

    return Array(defaultEndTime - defaultStartTime + 1)
      .fill(0)
      .map((_, i) => generateHour(i + defaultStartTime, is12HourMode));
  }
};

export const TimetableLayout: React.FC = () => {
  const { is12HourMode, days, earliestStartTime, latestEndTime, setAlertMsg, setErrorVisibility } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  const latestClassFinishTime = Math.max(...selectedCourses.map((course) => course.latestFinishTime));
  const earliestClassStartTime = Math.min(...selectedCourses.map((course) => course.earliestStartTime));

  const hoursRange = [
    Math.min(earliestStartTime, earliestClassStartTime, defaultStartTime),
    Math.max(latestEndTime, latestClassFinishTime, defaultEndTime) - 1,
  ];

  const hours: string[] = generateHours(hoursRange, is12HourMode, setAlertMsg, setErrorVisibility);
  const hourCells = hours.map((hour, i) => (
    <HourCell key={hour} x={1} y={i + 2} is12HourMode={is12HourMode} isEndY={i === hours.length - 1}>
      {hour}
    </HourCell>
  ));

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
