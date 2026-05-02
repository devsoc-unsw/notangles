import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { Term, useCoursesClassTimesQuery } from '../../../api/times/times';
import { useTimetableCoursesQuery } from '../../../api/timetable/queries';
import { contentPadding, inventoryMargin } from '../../../constants/theme';
import TimetableLayout from './TimetableLayout';

// TODO: Organise timetable constants better
const timetableWidth = 1100;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortDayToIndex: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

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

const Timetable: React.FC<{ timetableId: string; term: Term }> = ({ timetableId, term }) => {
  const courses = useTimetableCoursesQuery(timetableId);
  const classTimes = useCoursesClassTimesQuery(
    courses.map((c) => c.courseId),
    term.year,
    term.term,
  );

  // TODO: Integrate events into timetable sizing
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
    {
      latestDay: 4, // Friday
      earliestStartHour: 9,
      latestEndHour: 18,
    },
  );

  const cols = Math.max(5, latestDay + 1); // At least Monday to Friday
  const rows = latestEndHour - earliestStartHour; // Each hour is a row

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable cols={cols} rows={rows}>
        <TimetableLayout
          days={days.slice(0, cols)}
          earliestStartHour={earliestStartHour}
          latestEndHour={latestEndHour}
        />
        {/* <Dropzones assignedColors={assignedColors} /> */}
        {/* <DroppedCards days={days.slice(0, cols)/> */}
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default Timetable;
