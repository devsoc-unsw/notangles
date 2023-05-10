import React, { useContext, useRef, useState } from 'react';
import { styled } from '@mui/system';
import {
  classMargin,
  daysShort,
  getDefaultEndTime,
  getDefaultStartTime,
  headerPadding,
  rowHeight,
  unknownErrorMessage,
} from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { createNewEvent } from '../../utils/createEvent';
import { createDateWithTime } from '../../utils/eventTimes';
import CreateEventPopover from './CreateEventPopover';
import { EventPeriod } from '../../interfaces/Periods';
import { TimetableLayoutProps } from '../../interfaces/PropTypes';
import { Menu, MenuItem } from '@mui/material';

export const getClassMargin = (isSquareEdges: boolean) => (isSquareEdges ? 0 : classMargin);

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

/**
 * @param range The range of hours to generate
 * @param is12HourMode Whether 12-hour mode is set
 * @param setAlertMsg Sets an alert message
 * @param setErrorVisibility Sets the visibility of the error popup
 * @param isConvertToLocalTimezone Boolean for whether to convert to user's local timezone
 * @returns An array of hour strings
 */
const generateHours = (
  range: number[],
  is12HourMode: boolean,
  setAlertMsg: (newErrorMsg: string) => void,
  setErrorVisibility: (newVisibility: boolean) => void,
  isConvertToLocalTimezone: boolean
): string[] => {
  const [min, max] = range;

  const full24HoursArray = Array(24)
    .fill(0)
    .map((_, i) => generateHour(i + 0, is12HourMode));

  // Fill an array with hour strings according to the range
  try {
    if (min < max) {
      return Array(max - min + 1)
        .fill(0)
        .map((_, i) => generateHour(i + min, is12HourMode));
    }
    return full24HoursArray;
  } catch (err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);

    const defaultStartTime = getDefaultStartTime(isConvertToLocalTimezone);
    const defaultEndTime = getDefaultEndTime(isConvertToLocalTimezone);

    if (defaultStartTime < defaultEndTime) {
      return Array(defaultEndTime - defaultStartTime + 1)
        .fill(0)
        .map((_, i) => generateHour(i + defaultStartTime, is12HourMode));
    }
    return full24HoursArray;
  }
};

export const TimetableLayout: React.FC<TimetableLayoutProps> = ({ copiedEvent }) => {
  const [tempEventId, setTempEventId] = useState<string>('');
  const [createEventAnchorEl, setCreateEventAnchorEl] = useState<HTMLDivElement | HTMLButtonElement | null>(null);
  const [contextMenu, setContextMenu] = useState<null | { x: number; y: number }>(null);
  const open = Boolean(createEventAnchorEl);

  const { is12HourMode, days, earliestStartTime, latestEndTime, setAlertMsg, setErrorVisibility, isConvertToLocalTimezone } =
    useContext(AppContext);

  const hoursRange = [
    Math.floor(Math.min(earliestStartTime, getDefaultStartTime(isConvertToLocalTimezone))),
    Math.ceil(Math.max(latestEndTime, getDefaultEndTime(isConvertToLocalTimezone)) - 1),
  ];

  const eventDay = useRef<string>('Mo');
  const eventStartTime = useRef<Date>(createDateWithTime(9));
  const eventEndTime = useRef<Date>(createDateWithTime(10));

  const hours: string[] = generateHours(hoursRange, is12HourMode, setAlertMsg, setErrorVisibility, isConvertToLocalTimezone);
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

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    // Opens the create event popover
    setCreateEventAnchorEl(event.currentTarget);
  };

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  /**
   * Create a temporary DroppedEvent card where the user double clicked on the grid
   * @param x Coordinate of where user double clicked on grid, indicates day
   * @param y Coordinate of where user double clicked on grid, indicates time
   */
  const createTempEvent = (x: number, y: number) => {
    const newEvent = createNewEvent(
      '(No title)',
      '(No location)',
      '',
      '#1F7E8C',
      daysShort[x],
      createDateWithTime(earliestStartTime + y),
      createDateWithTime(earliestStartTime + y + 1)
    );

    setTempEventId(newEvent.event.id);

    setCreatedEvents({
      ...createdEvents,
      [newEvent.event.id]: newEvent,
    });
  };

  const handleClose = () => {
    setCreateEventAnchorEl(null);

    // Deletes temporary event created when user clicks out of popover
    for (const event in createdEvents) {
      if (event === tempEventId) {
        delete createdEvents[event];
        setCreatedEvents({ ...createdEvents });
      }
    }
  };

  const otherCells = hours.flatMap((_, y) =>
    days.flatMap((_, x) => (
      <GridCell
        key={x * 1000 + y}
        x={x + 2}
        y={y + 2}
        isEndX={x === days.length - 1}
        isEndY={y === hours.length - 1}
        id={x === 0 && y === 0 ? 'origin' : undefined}
        onDoubleClick={(event) => {
          handleOpen(event);
          createTempEvent(x, y);
          eventStartTime.current = createDateWithTime(earliestStartTime + y);
          eventEndTime.current = createDateWithTime(earliestStartTime + y + 1);
          eventDay.current = daysShort[x];
        }}
        onContextMenu={(e) => {
          handleContextMenu(e, x, y);
          console.log('easlier', earliestStartTime);
        }}
      />
    ))
  );

  otherCells.push(<InventoryCell key={-1} x={days.length + 3} y={2} yTo={-1} isEndX isEndY />);

  const handlePaste = () => {
    if (!copiedEvent) return;

    const eventStart = getEventTime(copiedEvent.time.start);
    const eventEnd = getEventTime(copiedEvent.time.end);
    const newEvent = createNewEvent(
      copiedEvent.event.name,
      copiedEvent.event.location,
      copiedEvent.event.description,
      copiedEvent.event.color,
      daysShort[copiedEvent.time.day],
      eventStart,
      eventEnd
    );
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  const getEventTime = (hour: number) => {
    const eventTime = new Date(0);
    eventTime.setHours(hour);
    eventTime.setMinutes((hour % 1) * 60);
    return eventTime;
  };

  // Update copiedEvent details to match the cell that was double clicked
  const handleContextMenu = (e: React.MouseEvent<HTMLElement>, x: number, y: number) => {
    if (copiedEvent) {
      e.preventDefault();
      setContextMenu(contextMenu === null ? { x: e.clientX, y: e.clientY } : null);
      const eventTimeLength = copiedEvent.time.end - copiedEvent.time.start;
      const startOffset = copiedEvent.time.start % 1;
      copiedEvent.time.day = x;
      copiedEvent.time.start = earliestStartTime + y + startOffset;
      copiedEvent.time.end = earliestStartTime + y + startOffset + eventTimeLength;
    }
  };

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

      {/* For when user double clicks on a timetable grid */}
      <CreateEventPopover
        open={open}
        anchorEl={createEventAnchorEl}
        handleClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        initialStartTime={eventStartTime.current}
        initialEndTime={eventEndTime.current}
        initialDay={eventDay.current}
        tempEventId={tempEventId}
      />

      {/* For right click menu on a cell */}
      <Menu
        open={contextMenu != null}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
        onClose={() => setContextMenu(null)}
      >
        <MenuItem onClick={handlePaste}>Paste</MenuItem>
      </Menu>
    </>
  );
};
