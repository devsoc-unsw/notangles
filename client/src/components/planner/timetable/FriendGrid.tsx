import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { TimetableEvent } from '../../../api/timetable/routes';
import { contentPadding, inventoryMargin } from '../../../constants/theme';
import { daysLong, shortDayToIndex, timetableWidth } from '../../../constants/timetable';
import { EventCard } from '../../../interfaces/Timetable';
import DroppedCards from './DroppedCards';
import TimetableLayout from './TimetableLayout';

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

/**
 * Draws a timetable from the given class times and events.
 * It doesn't load any data itself, so it can show either your own timetable or a friends.
 */

function TimetableGrid({
  timetableId,
  classTimes,
  events,
}: {
  timetableId: string;
  classTimes: { times: { day: string; time: string }[] }[];
  events: TimetableEvent[];
}) {
  const { latestDay, earliestStartHour, latestEndHour } = classTimes.reduce(
    (acc, cls) => {
      cls.times.forEach((time) => {
        const dayIndex = shortDayToIndex[time.day];
        if (dayIndex > acc.latestDay) {
          acc.latestDay = dayIndex;
        }
        // time field is "09:00 - 10:00"
        const [startTime, endTime] = time.time.split(' - ');
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = parseInt(endTime.split(':')[0], 10);
        if (startHour < acc.earliestStartHour) {
          acc.earliestStartHour = startHour;
        }
        if (endHour > acc.latestEndHour) {
          acc.latestEndHour = endHour;
        }
      });
      return acc;
    },
    events.reduce(
      (acc, event) => {
        if (event.dayOfWeek > acc.latestDay) {
          acc.latestDay = event.dayOfWeek;
        }
        const hour = Math.floor(event.start / 60);
        if (hour < acc.earliestStartHour) {
          acc.earliestStartHour = hour;
        }
        const endHour = Math.ceil(event.end / 60);
        if (endHour > acc.latestEndHour) {
          acc.latestEndHour = endHour;
        }
        return acc;
      },
      {
        latestDay: 4, // Friday
        earliestStartHour: 9,
        latestEndHour: 18,
      },
    ),
  );

  const cols = Math.max(5, latestDay + 1); // At least Monday to Friday
  const rows = latestEndHour - earliestStartHour; // Each hour is a row

  const eventCards: EventCard[] = events
    .map((event) => ({
      type: 'event' as const,
      name: event.title,
      location: event.location ?? undefined,
      color: event.colour,
      eventType: event.type,
      eventId: event.id,
      description: event.description ?? undefined,
      time: {
        day: event.dayOfWeek,
        start: event.start,
        end: event.end,
      },
    }))
    .sort((a, b) => {
      // Sorting keeps events in a consistent order (good for transitions)
      if (a.time.day !== b.time.day) {
        return a.time.day - b.time.day;
      }
      if (a.time.start !== b.time.start) {
        return a.time.start - b.time.start;
      }
      if (a.time.end !== b.time.end) {
        return a.time.end - b.time.end;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable cols={cols} rows={rows}>
        <TimetableLayout
          days={daysLong.slice(0, cols)}
          earliestStartHour={earliestStartHour}
          latestEndHour={latestEndHour}
        />
        {/* <Dropzones assignedColors={assignedColors} /> */}
        <DroppedCards
          timetableId={timetableId}
          numberOfDays={cols}
          earliestStartHour={earliestStartHour}
          events={eventCards}
          readOnly={true}
        />
      </StyledTimetable>
    </StyledTimetableScroll>
  );
}

export default TimetableGrid;
