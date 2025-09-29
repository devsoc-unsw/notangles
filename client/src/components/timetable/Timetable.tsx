import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useContext, useState } from 'react';

import { useGetAllClassesFromCourseIds } from '../../api/graphql/queries';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { contentPadding, inventoryMargin } from '../../constants/theme';
import { timetableWidth } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { EventPeriod } from '../../interfaces/Periods';
import { TimetableProps } from '../../interfaces/PropTypes';
import { ClassData, CourseActivities } from '../../interfaces/Timetable';
import { graphQLClassesToClassData } from '../../utils/graphQLClassesToClassData';
import DroppedCards from './DroppedCards';
import Dropzones from './Dropzones';
import { TimetableLayout } from './TimetableLayout';

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

const Timetable: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  // TODO: migrate selectedCourses to react-query
  const { days, earliestStartTime, latestEndTime, selectedCourses, term } = useContext(AppContext);
  const [copiedEvent, setCopiedEvent] = useState<EventPeriod | null>(null);
  const { convertToLocalTimezone } = useGetUserSettingsQuery();

  const courseIds = Object.keys(selectedCourses);
  // Fetch all classes for the selected courses
  const gqlClasses = useGetAllClassesFromCourseIds(courseIds, term.substring(0, 2));

  // Covert all graphql classes to ClassData
  const classes: Record<string, ClassData[]> = graphQLClassesToClassData(gqlClasses, convertToLocalTimezone);

  // Format the classes into courseActivities
  const courseActivities: CourseActivities = {};
  courseIds.forEach((courseId) => {
    courseActivities[courseId] = {};
    if (courseId in classes) {
      classes[courseId].forEach((classData) => {
        if (!(classData.activity in courseActivities[courseId])) {
          courseActivities[courseId][classData.activity] = [];
        }
        courseActivities[courseId][classData.activity].push(classData);
      });
    }
  });

  // Calculate the correct number of rows, accounting for when the earliest start time is later than latest end time.
  // E.g. starting at 7pm and ending at 4am.
  // TODO: fix the logic by using the new class data
  const numRows =
    latestEndTime > earliestStartTime ? latestEndTime - earliestStartTime : 24 - earliestStartTime + latestEndTime;

  return (
    <StyledTimetableScroll id="StyledTimetableScroll">
      <StyledTimetable cols={days.length} rows={numRows}>
        <TimetableLayout copiedEvent={copiedEvent} setCopiedEvent={setCopiedEvent} />
        <Dropzones courseActivities={courseActivities} />
        <DroppedCards
          assignedColors={assignedColors}
          courseActivities={courseActivities}
          handleSelectClass={handleSelectClass}
          setCopiedEvent={setCopiedEvent}
          copiedEvent={copiedEvent}
        />
      </StyledTimetable>
    </StyledTimetableScroll>
  );
};

export default Timetable;
