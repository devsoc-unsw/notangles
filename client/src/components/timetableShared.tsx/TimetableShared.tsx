import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import React, { useContext } from 'react';

import { UserContext } from '../../context/UserContext';
import { TimetableProps } from '../../interfaces/PropTypes';
import { emptyProfile } from '../sidebar/groupsSidebar/friends/UserProfile';
import Timetable from '../timetable/Timetable';

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
  const { groups, selectedGroupIndex } = useContext(UserContext);
  if (groups.length === 0) return <></>;
  const group = groups[selectedGroupIndex];

  return (
    <Container>
      <Legend>
        <MemberText>
          <GroupName>{group.name}</GroupName>
          <GroupDescription>{group.description}</GroupDescription>
        </MemberText>
        <Members>
          {group.members.map((member, i) => (
            <Tooltip title={`${member.firstname} ${member.lastname}`} key={i} placement="bottom">
              <img
                src={member.profileURL || emptyProfile}
                width={34}
                height={34}
                style={{ borderRadius: 999, backgroundColor: 'white' }}
              />
            </Tooltip>
          ))}
        </Members>
      </Legend>
      <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
    </Container>
  );
};

export default TimetableShared;
