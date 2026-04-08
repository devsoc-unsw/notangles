import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useMemo } from 'react';

import { useIncomingRequestsQuery } from '../../api/friendship/queries';
import { useAuth } from '../../hooks/useAuth';
import PendingInvitesBadge from './PendingInvitesBadge';

interface FriendsButtonProps {
  sidebarCollapsed: boolean;
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
  display: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '' : 'flex')};
  position: ${({ sidebarCollapsed }) => (sidebarCollapsed ? 'absolute' : 'static')};
  bottom: -2px;
  right: 14px;
`;

const IncomingRequestsBadge = ({
  sidebarCollapsed,
  friendsListOpen,
}: {
  sidebarCollapsed: boolean;
  friendsListOpen: boolean;
}) => {
  const incomingRequests = useIncomingRequestsQuery();
  return (
    <BadgePositioner sidebarCollapsed={sidebarCollapsed}>
      <PendingInvitesBadge count={incomingRequests.length} showBadge={!friendsListOpen} />
    </BadgePositioner>
  );
};

// TODO: Repurpose using Sunny's design for friends
const FriendsButton = ({ sidebarCollapsed, friendsListOpen, handleFriendsListToggle }: FriendsButtonProps) => {
  const { user } = useAuth();
  const isGuest = user?.isGuest ?? true;
  const friendToggleArrow = useMemo(() => {
    if (sidebarCollapsed) return null;
    return friendsListOpen ? <ArrowDropUp /> : <ArrowDropDown />;
  }, [sidebarCollapsed, friendsListOpen]);

  return (
    <Tooltip title={isGuest ? 'Sign in with a real account to use Friends' : 'Friends'} placement="right">
      <span>
        {/* Span allows mouse events (tooltip) to be handled when button is disabled */}
        <StyledFriendsButton
          color="inherit"
          isSelected={false}
          onClick={handleFriendsListToggle}
          disabled={isGuest}
          style={{ width: '100%' }}
        >
          <StyledFriendsContainer>
            <GroupIcon />
            <IndividualComponentTypography>{sidebarCollapsed ? '' : 'Friends'}</IndividualComponentTypography>
          </StyledFriendsContainer>
          <RightContainer>
            {!isGuest && (
              <IncomingRequestsBadge sidebarCollapsed={sidebarCollapsed} friendsListOpen={friendsListOpen} />
            )}
            {friendToggleArrow}
          </RightContainer>
        </StyledFriendsButton>
      </span>
    </Tooltip>
  );
};

export default FriendsButton;
