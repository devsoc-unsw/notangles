import { styled } from '@mui/system';

import FriendsActivity from './FriendsActivity';

const ActivityBarContainer = styled('div')`
  position: fixed;
  top: 64px;
  right: 0;
  padding: 12px 32px;
  z-index: 999;
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
