import styled from '@emotion/styled';
import React, { useContext, useEffect } from 'react';

import { CourseContext } from '../../context/CourseContext';
import { UserContext } from '../../context/UserContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import Timetable from '../timetable/Timetable';
import { CourseData, CreatedEvents, SelectedClasses } from '../../interfaces/Periods';
import { User } from '../sidebar/UserAccount';

const Container = styled('div')`
  margin-top: 12px;
`;

const TimetableShared: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  const { groups, groupsSidebarCollapsed, user, selectedGroupIndex } = useContext(UserContext);
  if (groups.length === 0) return <></>;
  const group = groups[selectedGroupIndex];
  const userTimetable = user.timetables[0];

  const { setAssignedColors, setSelectedCourses, setSelectedClasses, setCreatedEvents } = useContext(CourseContext);

  const showPersonalTimetable = () => {
    ///////// TODO uncomment below when BE done, so that user.timetable works.
    // const { selectedCourses, selectedClasses, createdEvents, assignedColors } = user.timetables[selectedTimetable];
    // setSelectedCourses(selectedCourses);
    // setSelectedClasses(selectedClasses);
    // setCreatedEvents(createdEvents);
    // setAssignedColors(assignedColors);
  };

  // Helper function that combines users' courses, classes and created events, with no duplicates.
  const combineUsersActivities = (users: User[]) => {
    let newSelectedCourses: CourseData[] = [];
    const newSelectedClasses: SelectedClasses = {};
    const newCreatedEvents: CreatedEvents = {};

    for (const user of users) {
      newSelectedCourses = [...new Set([...newSelectedCourses, ...user.timetables[0].selectedCourses])];
      Object.assign(newSelectedClasses, user.timetables[0].selectedClasses);
      Object.assign(newCreatedEvents, user.timetables[0].createdEvents);
    }

    return { newSelectedCourses, newSelectedClasses, newCreatedEvents };
  };

  // Sets selectedCourses, selectedClasses and createdEvents as the combined activities of the group's members and admins.
  const setSharedActivities = () => {
    const mergedMembers = combineUsersActivities(group.members);
    const mergedAdmins = combineUsersActivities(group.groupAdmins);
    setSelectedCourses([...new Set([...mergedMembers.newSelectedCourses, ...mergedAdmins.newSelectedCourses])]);
    setSelectedClasses(Object.assign(mergedMembers.newSelectedClasses, mergedAdmins.newSelectedClasses));
    setCreatedEvents(Object.assign(mergedMembers.newCreatedEvents, mergedAdmins.newCreatedEvents));
  };

  const setSharedAssignedColours = () => {
    const newAssignedColours: Record<string, string> = {};
    // Friend's activities has grey colour of: '#D3D3D3'
    group.members.map((member) => {
      member.timetables[0].selectedCourses.map((course) => {
        newAssignedColours[course.code] = '#D3D3D3';
      });
    });
    // Logged in user has unique colour of: #137786 Turquoise
    userTimetable.selectedCourses.map((course) => {
      newAssignedColours[course.code] = '#137786';
    }),
      setAssignedColors(newAssignedColours);
  };

  const showSharedTimetable = () => {
    setSharedActivities();
    setSharedAssignedColours();
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
