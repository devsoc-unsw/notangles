import { styled } from '@mui/system';
import React from 'react';

import FriendsActivity from './FriendsActivity';

const ActivityBarContainer = styled('div')`
  position: fixed;
  top: 64px;
  right: 0;
  padding: 12px 64px;
  z-index: 1000;
  background: white;
  height: 100vh;
`;

const StyledTitle = styled('p')`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const ActivityBar = () => {
  return (
    <ActivityBarContainer>
      <StyledTitle>Your Friends Activity</StyledTitle>
      <FriendsActivity />
    </ActivityBarContainer>
  );
};

export default ActivityBar;
