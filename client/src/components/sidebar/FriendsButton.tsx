import { ArrowDropDown, ArrowDropUp, Person } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useContext, useMemo } from 'react';

import { AppContext } from '../../context/AppContext';
import PendingInvitesBadge from './PendingInvitesBadge';

interface FriendsButtonProps {
  friendsListOpen: boolean;
  handleFriendsListToggle: () => void;
}

const StyledFriendsButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'isSelected' })<{
  isSelected: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 8px;
  padding: 12px;
  background-color: ${({ isSelected }) => (isSelected ? 'rgb(157, 157, 157, 0.15)' : 'transparent')};
`;

const StyledFriendsContainer = styled(Box)`
  display: flex;
  justify-content: flex-start;
  gap: 16px;
`;

const IndividualComponentTypography = styled(Typography)`
  font-size: 16px;
`;

const RightContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const BadgePositioner = styled('div', { shouldForwardProp: (prop) => prop !== 'sidebarCollapsed' })<{
  sidebarCollapsed: boolean;
}>`
  display: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '' : 'flex' )};
  position: ${({ sidebarCollapsed }) => (sidebarCollapsed ? 'absolute' : 'static' )};
  bottom: -2px;
  right: 14px;
`;

// TODO: Repurpose using Sunny's design for friends
const FriendsButton = ({ friendsListOpen, handleFriendsListToggle }: FriendsButtonProps) => {
  const { sidebarCollapsed } = useContext(AppContext);
  const friendToggleArrow = useMemo(() => {
    if (sidebarCollapsed) return null;
    return friendsListOpen ? <ArrowDropUp /> : <ArrowDropDown />;
  }, [sidebarCollapsed, friendsListOpen]);
  const friendInvites = 2; // Hardcoded 

  return (
    <Tooltip title="Friends" placement="right">
      <StyledFriendsButton color="inherit" isSelected={false} onClick={handleFriendsListToggle}>
        <StyledFriendsContainer>
          <GroupIcon />
          <IndividualComponentTypography>{sidebarCollapsed ? '' : 'Friends'}</IndividualComponentTypography>
        </StyledFriendsContainer>
        <RightContainer>
          <BadgePositioner sidebarCollapsed={sidebarCollapsed}>
            <PendingInvitesBadge count={friendInvites} showBadge={!friendsListOpen}/>
          </BadgePositioner>
          {friendToggleArrow}
        </RightContainer>
        
      </StyledFriendsButton>
    </Tooltip>
  );
};

export default FriendsButton;
