import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContext';
import { ClassPeriod } from '../../interfaces/Periods';
import { User } from '../sidebar/UserAccount';
import UserIcon from '../user/UserIcon';

interface MembersListOfAnActivityProps {
  classPeriod: ClassPeriod;
}

const UserIconContainer = styled('div')`
  margin-right: 6px;
`;

export const hasSelectedTheClass = (user: User, courseCode: string, activity: string, classId: string | null) => {
  // user.timetables[0].selectedClasses[courseCode]?.[activity]?.['id'] === classId;
  return true;
};

const ClassMembersList: React.FC<MembersListOfAnActivityProps> = ({ classPeriod }) => {
  const { groups, selectedGroupIndex } = useContext(UserContext);
  const selectedGroup = groups[selectedGroupIndex];
  const { courseCode, classId, activity } = classPeriod;

  const filterMembersOfAClass = (members: User[]) =>
    members.filter((member) => hasSelectedTheClass(member, courseCode, activity, classId));

  return (
    <>
      {filterMembersOfAClass(selectedGroup.groupAdmins).map((admin) => (
        <UserIconContainer>
          <UserIcon url={admin.profileURL} tooltipTitle={`${admin.firstname} ${admin.lastname}`} />
        </UserIconContainer>
      ))}
      {filterMembersOfAClass(selectedGroup.members).map((member) => (
        <UserIconContainer>
          <UserIcon url={member.profileURL} tooltipTitle={`${member.firstname} ${member.lastname}`} />
        </UserIconContainer>
      ))}
    </>
  );
};

export default ClassMembersList;
