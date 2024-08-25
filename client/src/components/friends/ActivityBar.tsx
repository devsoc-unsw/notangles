import React from 'react';
import { styled } from '@mui/system';
import FriendsActivity from './FriendActivity';

const ActivityBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  width: 340px;
  height: 100vh;
  border-left: 1px solid gray;
  background-color: white;
  padding: 30px;
  gap: 20px;
`;

const StyledTitle = styled('p')`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const ActivityBar: React.FC = ({}) => {
  return (
    <ActivityBarContainer>
      <StyledTitle>Your Friends</StyledTitle>
      <FriendsActivity />
    </ActivityBarContainer>
  );
};

export default ActivityBar;
