import React from 'react';
import { styled } from '@mui/system';
import FriendsActivity from './FriendsActivity';

const ActivityBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  width: 340px;
  height: 100vh;
  border-left: 1px solid #eee;
  padding: 30px;
  gap: 20px;
  align-items: flex-start;
`;

const StyledTitle = styled('p')`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const ActivityBar: React.FC = ({}) => {
  return (
    <ActivityBarContainer>
      <StyledTitle>Your Friends Activity</StyledTitle>
      <FriendsActivity />
    </ActivityBarContainer>
  );
};

export default ActivityBar;
