import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, styled, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useState } from 'react';

import { AppContext } from '../../../context/AppContext';
import UserProfile from './UserProfile';

const StyledFriendContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
`;

const Friend = () => {
  const [kebabOpen, setKebabOpen] = useState(false);
  const { sidebarCollapsed } = useContext(AppContext);

  return (
    <>
      <Tooltip title={sidebarCollapsed ? 'Lucas Harvey' : ''} placement="right">
        <StyledFriendContainer>
          <UserProfile firstName="Lucas" lastName="Harvey" />
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
    </>
  );
};

export default Friend;
