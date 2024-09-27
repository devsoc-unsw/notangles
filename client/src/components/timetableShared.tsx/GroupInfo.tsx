import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContext';
import UserIcon from '../user/UserIcon';

const Container = styled('div')`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 12px 66px;
  background: white;
  width: 90%;
  margin-left: 140px;
  border-bottom: 1px solid #E0E0E0;
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

const GroupInfo = () => {
  const { groups, selectedGroupIndex } = useContext(UserContext);
  if (groups.length === 0) return <></>;
  const group = groups[selectedGroupIndex];

  return (
    <Container>
      <MemberText>
        <GroupName>{group.name}</GroupName>
        <GroupDescription>{group.description}</GroupDescription>
      </MemberText>
      <Members>
        {group.members.map((member, i) => (
          <UserIcon url={member.profileURL} tooltipTitle={`${member.firstname} ${member.lastname}`} />
        ))}
      </Members>
    </Container>
  );
};

export default GroupInfo;
