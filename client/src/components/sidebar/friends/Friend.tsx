import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, styled, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { AppContext } from '../../../context/AppContext';
import UserProfile from './UserProfile';
import RemoveFriend from './RemoveFriend';

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
      isDarkMode ? theme.palette.secondary.dark : theme.palette.secondary.light}
`;

export interface FriendDTO {
  firstName: string;
  lastName: string;
  id: string;
  profileURL: string;
}

const Friend = ({ firstName, lastName, id, profileURL }: FriendDTO) => {
  const { sidebarCollapsed } = useContext(AppContext);
  const { isDarkMode } = useGetUserSettingsQuery();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleKebabClick = (event: React.MouseEvent<HTMLElement>) => {
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

  return (
    <Tooltip title={sidebarCollapsed ? `${firstName} ${lastName}` : ''} placement="right">
      <StyledFriendContainer isDarkMode={isDarkMode} sidebarCollapsed={sidebarCollapsed} onClick={handleFriendClick}>
        <UserProfile firstName={firstName} lastName={lastName} profileURL={profileURL} />
        {!sidebarCollapsed && (
          <>
            <IconButton onClick={handleKebabClick}>
              <MoreVertIcon />
            </IconButton>
            <RemoveFriend anchorEl={anchorEl} open={kebabOpen} onClose={handlePopoverClose} firstName={firstName} />
          </>
        )}
      </StyledFriendContainer>
    </Tooltip>
  );
};

export default Friend;
