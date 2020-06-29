import React, { FunctionComponent } from 'react';
import styled, { css } from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData } from '../../interfaces/CourseData';
import { defaultStartTime, defaultEndTime } from '../../constants/timetable';

const headerPadding = 15;

const BaseCell = styled.div<{
  x: number
  y: number
  endX?: boolean
  endY?: boolean
}>`
  grid-column: ${(props) => props.x + 1};
  grid-row: ${(props) => props.y + 1};
  box-shadow: 0 0 0 ${1 / devicePixelRatio}px ${(props) => props.theme.palette.secondary.main};
  background-color: ${(props) => props.theme.palette.background.default};
  z-index: 10;

  border-top-left-radius: ${(props) => (
    props.x === 1 && props.y === 1 ? props.theme.shape.borderRadius : 0
  )}px;
  border-bottom-left-radius: ${(props) => (
    props.x === 1 && props.endY ? props.theme.shape.borderRadius : 0
  )}px;
  border-top-right-radius: ${(props) => (
    props.endX && props.y === 1 ? props.theme.shape.borderRadius : 0
  )}px;
  border-bottom-right-radius: ${(props) => (
    props.endX && props.endY ? props.theme.shape.borderRadius : 0
  )}px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const DoubleCell = styled(BaseCell) <{
  y: number
}>`
  grid-row: ${(props) => {
    props.y = props.y * 2 - 1;
    return `${props.y} / ${props.y + 2}`;
  }};
`;

const DayCell = styled(BaseCell)`
  padding: ${headerPadding}px 0;
`;

const paddingStyle = css`
  padding: 0 ${headerPadding}px;
`;

const HourCell = styled(DoubleCell) <{
  is12HourMode: boolean
}>`
  ${paddingStyle}
  display: grid;
  justify-content: ${(props) => (props.is12HourMode ? 'end' : 'center')};
`;

const ToggleCell = styled(BaseCell)`
  ${paddingStyle}
  display: grid;
  justify-content: center;

  & span {
    grid-column: 1;
    grid-row: 1;
  }
`;

const Is12HourModeToggle = styled(Box)`
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: color 100ms;
  color: ${(props) => props.theme.palette.primary.main};

  &:hover {
    color: ${(props) => props.theme.palette.primary.dark};
  }
`;

const ColumnWidthGuide = styled.span`
  opacity: 0;
  pointer-events: none;
`;

const generateHour = (n: number, is12HourMode: boolean): string => {
  if (is12HourMode) {
    const period = n < 12 ? 'AM' : 'PM';
    if (n > 12) n -= 12;
    return `${n} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

const generateHours = (range: number[], is12HourMode: boolean): string[] => {
  const [min, max] = range;
  // Fill an array with hour strings according to the range
  return Array(max - min + 1).fill(0).map((_, i) => generateHour(i + min, is12HourMode));
};

interface TimetableLayoutProps {
  days: string[]
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  selectedCourses: CourseData[]
}

const TimetableLayout: FunctionComponent<TimetableLayoutProps> = ({
  days,
  is12HourMode,
  setIs12HourMode,
  selectedCourses,
}) => {
  const latestClassFinishTime = Math.max(...selectedCourses.map(
    (course) => course.latestFinishTime,
  ));
  const hoursRange = [defaultStartTime, Math.max(latestClassFinishTime, defaultEndTime) - 1];
  const hours: string[] = generateHours(hoursRange, is12HourMode);

  const dayCells = days.map((day, i) => (
    <DayCell key={day} x={i + 2} y={1} endX={i === days.length - 1}>
      {day}
    </DayCell>
  ));

  const hourCells = hours.map((hour, i) => (
    <HourCell key={hour} x={1} y={i + 2} is12HourMode={is12HourMode} endY={i === hours.length - 1}>
      {hour}
    </HourCell>
  ));

  const otherCells = hours.map(
    (_, y) => days.map(
      (_, x) => (
        <DoubleCell
          key={x * 1000 + y}
          x={x + 2}
          y={y + 2}
          endX={x === days.length - 1}
          endY={y === hours.length - 1}
        />
      ),
    ),
  );

  return (
    <>
      <ToggleCell key={0} x={1} y={1}>
        <Is12HourModeToggle component="span" onClick={() => setIs12HourMode(!is12HourMode)}>
          {`${is12HourMode ? '12' : '24'} h`}
        </Is12HourModeToggle>
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

export default TimetableLayout;
