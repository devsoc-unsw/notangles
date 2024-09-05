import React, { useContext } from 'react';
import { TimetableProps } from '../../interfaces/PropTypes';
import Timetable from '../timetable/Timetable';
import { UserContext } from '../../context/UserContext';
import styled from '@emotion/styled';
import { Tooltip, Typography } from '@mui/material';
import UserProfile, { emptyProfile } from '../sidebar/groupsSidebar/friends/UserProfile';

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

const TimetableShared: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  const { groups, selectedGroupIndex } = useContext(UserContext);
  const group = groups[selectedGroupIndex];

  return (
    <Container>
      <Legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'start'}}>
          <div style={{fontSize: 16}}>{group.name}</div>
          <div style={{fontSize: 12}}>{group.description}</div>
        </div>
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
