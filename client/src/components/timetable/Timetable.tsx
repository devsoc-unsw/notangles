import React from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, ClassData, SelectedClasses, ClassPeriod } from '../../interfaces/Course';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import { contentPadding } from '../../constants/theme';
import { TimetableLayout } from './TimetableLayout';
import Dropzones from './Dropzones';
import DroppedClasses, { inventoryMargin } from './DroppedClasses';
import { timetableWidth } from '../../utils/Drag';

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
  handleSelectClass(classData: ClassData): void;
  assignedColors: Record<string, string>;
  is12HourMode: boolean;
  setIs12HourMode(value: boolean): void;
  clashes: Array<ClassPeriod>;
  isSquareEdges: boolean;
  setInfoVisibility(value: boolean): void;
  isHideFullClasses: boolean;
  isHideClassInfo: boolean;
}

// beware memo - if a component isn't re-rendering, it could be why
const Timetable: React.FC<TimetableProps> = React.memo(
  ({
    selectedCourses,
    selectedClasses,
    assignedColors,
    is12HourMode,
    setIs12HourMode,
    isSquareEdges,
    clashes,
    setInfoVisibility,
    handleSelectClass,
    isHideFullClasses,
    isHideClassInfo,
  }) => (
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
          isHideFullClasses={isHideFullClasses}
        />
        <DroppedClasses
          selectedCourses={selectedCourses}
          selectedClasses={selectedClasses}
          assignedColors={assignedColors}
          days={days}
          clashes={clashes}
          isSquareEdges={isSquareEdges}
          setInfoVisibility={setInfoVisibility}
          handleSelectClass={handleSelectClass}
          isHideClassInfo={isHideClassInfo}
          isHideFullClasses={isHideFullClasses}
        />
      </StyledTimetable>
    </StyledTimetableScroll>
  ),
  (prev, next) =>
    !(
      prev.is12HourMode !== next.is12HourMode ||
      prev.selectedClasses !== next.selectedClasses ||
      prev.selectedCourses.length !== next.selectedCourses.length ||
      prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code) ||
      JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors) ||
      prev.isSquareEdges !== next.isSquareEdges ||
      prev.isHideFullClasses !== next.isHideFullClasses ||
      prev.isHideClassInfo !== next.isHideClassInfo
    )
);

export default Timetable;
