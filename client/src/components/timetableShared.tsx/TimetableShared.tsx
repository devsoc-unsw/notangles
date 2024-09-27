import styled from '@emotion/styled';
import React, { useContext, useEffect } from 'react';

import { CourseContext } from '../../context/CourseContext';
import { UserContext } from '../../context/UserContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import Timetable from '../timetable/Timetable';
import UserIcon from '../user/UserIcon';

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Legend = styled('div')`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 12px 32px;
  border-radius: 12px;
  border: 1px dotted grey;
  width: fit-content;
  margin: 12px;
  align-self: center;
`;

const Members = styled('div')`
  display: flex;
  gap: 2px;
`;

const MemberText = styled('div')`
  display: flex;
  gap: 2px;
  flex-direction: column;
  align-items: start;
`;

const GroupName = styled('div')`
  font-size: 18px;
  font-weight: 600;
`;

const GroupDescription = styled('div')`
  font-size: 14px;
`;

const TimetableShared: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  const { groups, selectedGroupIndex, groupsSidebarCollapsed } = useContext(UserContext);
  if (groups.length === 0) return <></>;
  const group = groups[selectedGroupIndex];

  const { selectedCourses, setSelectedCourses, setSelectedClasses, setCreatedEvents, setAssignedColors } =
    useContext(CourseContext);

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
    // can't change colours of classes
  };

  // update timetable shown when switching between Shared and Personal timetables.
  useEffect(() => (groupsSidebarCollapsed ? showPersonalTimetable() : showSharedTimetable()), [groupsSidebarCollapsed]);

  return (
    <Container>
      <Legend>
        <MemberText>
          <GroupName>{group.name}</GroupName>
          <GroupDescription>{group.description}</GroupDescription>
        </MemberText>
        <Members>
          {group.members.map((member, i) => (
            <UserIcon url={member.profileURL} tooltipTitle={`${member.firstname} ${member.lastname}`} />
          ))}
        </Members>
      </Legend>
      <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
    </Container>
  );
};

export default TimetableShared;
