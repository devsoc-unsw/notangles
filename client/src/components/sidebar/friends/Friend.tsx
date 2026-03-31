import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Alert, IconButton, Snackbar, styled, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { FriendInfo } from '../../../interfaces/User';
import RemoveFriend from './RemoveFriend';
import UserProfile from './UserProfile';

const StyledFriendContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDarkMode' && prop !== 'sidebarCollapsed',
})<{ isDarkMode: boolean; sidebarCollapsed: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ sidebarCollapsed }) => (sidebarCollapsed ? 'center' : 'space-between')};
  align-items: center;
  padding: 4px;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme, isDarkMode }) =>
      isDarkMode ? theme.palette.secondary.dark : theme.palette.secondary.light};
  }
`;

interface FriendProps extends FriendInfo {
  sidebarCollapsed: boolean;
}

const Friend = ({ sidebarCollapsed, firstName, lastName, id, profilePictureUrl }: FriendProps) => {
  const { isDarkMode } = useGetUserSettingsQuery();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showRemovedBanner, setShowRemovedBanner] = useState(false);

  const handleKebabClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const kebabOpen = Boolean(anchorEl);

  const navigate = useNavigate();

  const handleFriendClick = useCallback(() => {
    navigate(`/friend/${id}`);
  }, [id, navigate]);

  const handleBannerClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setShowRemovedBanner(false);
  };

  return (
    <>
      <Tooltip title={sidebarCollapsed ? `${firstName} ${lastName}` : ''} placement="right">
        <StyledFriendContainer isDarkMode={isDarkMode} sidebarCollapsed={sidebarCollapsed} onClick={handleFriendClick}>
          <UserProfile
            sidebarCollapsed={sidebarCollapsed}
            firstName={firstName}
            lastName={lastName}
            profilePictureUrl={profilePictureUrl}
          />
          {!sidebarCollapsed && (
            <>
              <IconButton onClick={handleKebabClick}>
                <MoreVertIcon />
              </IconButton>
              <RemoveFriend
                anchorEl={anchorEl}
                open={kebabOpen}
                onClose={handlePopoverClose}
                id={id}
                firstName={firstName}
                lastName={lastName}
                profilePictureUrl={profilePictureUrl}
                onRemoveSuccess={() => {
                  setShowRemovedBanner(true);
                }}
              />
            </>
          )}
        </StyledFriendContainer>
      </Tooltip>
      <Snackbar open={showRemovedBanner} autoHideDuration={3000} onClose={handleBannerClose}>
        <Alert variant="filled" severity="success" sx={{ width: '100%' }} onClose={handleBannerClose}>
          Removed friend from friends list
        </Alert>
      </Snackbar>
    </>
  );
};

export default Friend;
