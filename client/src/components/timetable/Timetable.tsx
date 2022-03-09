import React, { useContext } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, SelectedClasses, ClassPeriod } from '../../interfaces/Course';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import { contentPadding } from '../../constants/theme';
import { TimetableLayout } from './TimetableLayout';
import Dropzones from './Dropzones';
import DroppedClasses, { inventoryMargin } from './DroppedClasses';
import { timetableWidth } from '../../utils/Drag';
import { AppContext } from '../../AppContext';

const StyledTimetable = styled(Box)<{
  rows: number;
}>`
  display: grid;
  min-width: ${timetableWidth}px;
  padding: ${contentPadding}px;
  box-sizing: content-box;
  user-select: none;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template:
    auto repeat(${({ rows }) => rows}, 1fr)
    / auto repeat(${days.length}, minmax(0, 1fr)) ${inventoryMargin}px minmax(0, 1fr);
`;

const StyledTimetableScroll = styled(Box)`
  padding: ${1 / devicePixelRatio}px;
  position: relative;
  left: -${contentPadding}px;
  width: calc(100% + ${contentPadding * 2 - (1 / devicePixelRatio) * 2}px);
  overflow-x: scroll;
  overflow-y: hidden;
`;

interface TimetableProps {
  selectedCourses: CourseData[];
  selectedClasses: SelectedClasses;
  assignedColors: Record<string, string>;
  clashes: Array<ClassPeriod>;
  isSquareEdges: boolean;
  setInfoVisibility(value: boolean): void;
}

// beware memo - if a component isn't re-rendering, it could be why
const Timetable: React.FC<TimetableProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  isSquareEdges,
  clashes,
  setInfoVisibility,
}) => {
  const { is12HourMode, setIs12HourMode } = useContext(AppContext);

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable
        rows={
          Math.max(...selectedCourses.map((course) => course.latestFinishTime), defaultEndTime) -
          Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime)
        }
      >
        <TimetableLayout
          days={days}
          is12HourMode={is12HourMode}
          setIs12HourMode={setIs12HourMode}
          selectedCourses={selectedCourses}
        />
        <Dropzones
          selectedCourses={selectedCourses}
          assignedColors={assignedColors}
          earliestStartTime={Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime)}
        />
        <DroppedClasses
          selectedCourses={selectedCourses}
          selectedClasses={selectedClasses}
          assignedColors={assignedColors}
          days={days}
          clashes={clashes}
          isSquareEdges={isSquareEdges}
          setInfoVisibility={setInfoVisibility}
        />
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default Timetable;
