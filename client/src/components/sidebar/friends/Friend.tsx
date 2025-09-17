import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, styled, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useState } from 'react';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { AppContext } from '../../../context/AppContext';
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
      isDarkMode ? theme.palette.secondary.dark : theme.palette.secondary.light}
`;

interface FriendProps {
  firstName: string;
}

const Friend = ({ firstName }: FriendProps) => {
  const [kebabOpen, setKebabOpen] = useState(false);
  const { sidebarCollapsed } = useContext(AppContext);
  const { isDarkMode } = useGetUserSettingsQuery();

  return (
    <Tooltip title={sidebarCollapsed ? firstName : ''} placement="right">
      <StyledFriendContainer isDarkMode={isDarkMode} sidebarCollapsed={sidebarCollapsed}>
        <UserProfile firstName={firstName} lastName="" />
        {!sidebarCollapsed && (
          <IconButton
            onClick={() => {
              setKebabOpen((prev) => !prev);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </StyledFriendContainer>
    </Tooltip>
  );
};

export default Friend;
