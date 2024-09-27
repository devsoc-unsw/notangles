import styled from '@emotion/styled';
import React, { useContext, useEffect } from 'react';

import { CourseContext } from '../../context/CourseContext';
import { UserContext } from '../../context/UserContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import Timetable from '../timetable/Timetable';

const Container = styled('div')`
  margin-top: 12px;
`;

const TimetableShared: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  const { groups, groupsSidebarCollapsed } = useContext(UserContext);
  if (groups.length === 0) return <></>;

  const { selectedCourses, setAssignedColors } = useContext(CourseContext);

  const showPersonalTimetable = () => {
    ///////// TODO uncomment below when BE done, so that user.timetable works.
    // const { selectedCourses, selectedClasses, createdEvents, assignedColors } = user.timetables[selectedTimetable];
    // setSelectedCourses(selectedCourses);
    // setSelectedClasses(selectedClasses);
    // setCreatedEvents(createdEvents);
    // setAssignedColors(assignedColors);
  };

  const getNewAssignedColours = () => {
    const newAssignedColours: Record<string, string> = {};
    // Friend's activities has grey colour of: '#D3D3D3'
    // group.members.map((member) =>
    //   member.timetables[0].selectedCourses.map((course) => {
    //     newAssignedColours[course.code] = '#D3D3D3';
    //   }),
    // );

    // Logged in user has unique colour of: #137786 Turquoise
    selectedCourses.map((course) => {
      newAssignedColours[course.code] = '#137786';
    });

    setAssignedColors(newAssignedColours);
  };

  const showSharedTimetable = () => {
    getNewAssignedColours();
    // can't drag friend's events
    // for ExpandedClassView, show friends only sharing the class.
    // showing only first personal timetable
    // group banner
  };

  // update timetable shown when switching between Shared and Personal timetables.
  useEffect(() => (groupsSidebarCollapsed ? showPersonalTimetable() : showSharedTimetable()), [groupsSidebarCollapsed]);

  return (
    <Container>
      <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
    </Container>
  );
};

export default TimetableShared;
