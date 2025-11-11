import { styled } from '@mui/material';

import { useGetUserSettingsQuery } from '../../../api/user/queries';

// TODO: Organise timetable constants better
const headerPadding = 10;
const rowHeight = 60;

const BaseCell = styled('div', {
  shouldForwardProp: (prop) => !['x', 'y', 'yTo', 'isEndX', 'isEndY'].includes(prop.toString()),
})<{
  x: number;
  y: number;
  yTo?: number;
  isEndX?: boolean;
  isEndY?: boolean;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}>`
  grid-column: ${({ x }) => x};
  grid-row: ${({ y }) => y} / ${({ y, yTo }) => yTo ?? y};
  background: ${({ theme }) => theme.palette.background.default};
  z-index: 10;
  transition:
    background 0.2s,
    box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: solid ${({ theme }) => theme.palette.secondary.main} 1px;
  outline-offset: -0.5px;

  border-bottom-left-radius: ${({ theme, x, isEndY }) => (x === 2 && isEndY ? theme.shape.borderRadius : 0)}px;
  border-top-right-radius: ${({ theme, isEndX, y }) => (isEndX && y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-right-radius: ${({ theme, isEndX, isEndY }) => (isEndX && isEndY ? theme.shape.borderRadius : 0)}px;
`;

const GridCell = styled(BaseCell)`
  height: ${rowHeight}px;
`;

const HourCell = styled(GridCell, {
  shouldForwardProp: (prop) => prop !== 'is12HourMode',
})<{ is12HourMode: boolean }>`
  padding: 0 ${headerPadding}px;
  display: grid;
  justify-content: ${({ is12HourMode }) => (is12HourMode ? 'end' : 'center')};
  margin-top: -${rowHeight / 2 + 1}px;
  outline: none;
`;

const DayCell = styled(BaseCell)`
  padding: ${headerPadding}px 0;
  border-bottom: 2px solid ${({ theme }) => theme.palette.secondary.main};
`;

const InventoryCell = styled(DayCell)`
  border-top-left-radius: ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-top-right-radius: ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-left-radius: ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-right-radius: ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
`;

const ToggleCell = styled(BaseCell)`
  padding: 0 ${headerPadding}px;
  display: grid;
  justify-content: center;
  outline: none;

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
    return `${String(n)} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

const generateHours = (startHour: number, endHour: number, is12HourMode: boolean): string[] => {
  const full24HoursArray = Array(24)
    .fill(0)
    .map((_, i) => generateHour(i + 0, is12HourMode));

  // Fill an array with hour strings according to the range
  if (startHour < endHour) {
    return Array(endHour - startHour)
      .fill(0)
      .map((_, i) => generateHour(i + startHour, is12HourMode));
  }
  return full24HoursArray;
};

const TimetableLayout: React.FC<{
  days: string[];
  earliestStartHour: number;
  latestEndHour: number;
}> = ({ days, earliestStartHour, latestEndHour }) => {
  // TODO: Handle local timezone
  const { is12HourMode } = useGetUserSettingsQuery();

  const hours = generateHours(earliestStartHour, latestEndHour, is12HourMode);
  const hourCells = hours.map((hour, i) => (
    <HourCell key={hour} x={1} y={i + 2} is12HourMode={is12HourMode}>
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
    </InventoryCell>,
  );

  const otherCells = hours
    .map((h, y) =>
      days.map((d, x) => (
        <GridCell
          key={`${d}-${h}`}
          x={x + 2}
          y={y + 2}
          isEndX={x === days.length - 1}
          isEndY={y === hours.length - 1}
          id={x === 0 && y === 0 ? 'origin' : undefined}
          // TODO: Handle creating event on double click and (right click) context menu
          // onDoubleClick={(event) => {
          //   handleOpen(event);
          //   createTempEvent(x, y);
          //   eventStartTime.current = createDateWithTime(earliestStartTime + y);
          //   eventEndTime.current = createDateWithTime(earliestStartTime + y + 1);
          //   eventDay.current = daysShort[x];
          // }}
          // onContextMenu={(e) => {
          //   if (!copiedEvent) return;
          //   handleContextMenu(e, copiedEvent, setCopiedEvent, x, y + earliestStartTime, setContextMenu);
          // }}
        />
      )),
    )
    .flat();

  otherCells.push(<InventoryCell key="unplanned-cell" x={days.length + 3} y={2} yTo={-1} isEndX isEndY />);

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
      {
        // TODO: Create event pop-over
        // TODO: Right click menu
      }
    </>
  );
};

export default TimetableLayout;
