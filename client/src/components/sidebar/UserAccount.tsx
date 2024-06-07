import React from 'react';
import { LoginRounded, AccountCircle, LogoutRounded } from '@mui/icons-material';
import { styled } from '@mui/system';
import { Button, IconButton, Tooltip } from '@mui/material';

interface UserAccountProps {
  login: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const UserAuth = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledIconButton = styled(IconButton)`
  display: flex;
  gap: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  padding: 12px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledButton = styled(Button)`
  min-width: 250px;
  min-height: 40px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
`;

const StyledAccountIcon = styled(AccountCircle)`
  width: 28px;
  height: 28px;
`;

const UserAccount: React.FC<UserAccountProps> = ({ login, onClick, collapsed }) => {
  if (!login) {
    return collapsed ? (
      <Tooltip title="Log in" placement="right">
        <StyledIconButton onClick={onClick}>
          <LoginRounded />
        </StyledIconButton>
      </Tooltip>
    ) : (
      <StyledButton onClick={onClick}>Log in</StyledButton>
    );
  }

  return (
    <UserAuth>
      {collapsed ? (
        <Tooltip title="Log out" placement="right">
          <StyledIconButton onClick={onClick}>
            <LogoutRounded />
          </StyledIconButton>
        </Tooltip>
      ) : (
        <>
          <UserInfo>
            <StyledAccountIcon />
            {/* TODO: handle user's name */}
            <p>User's Name</p>
          </UserInfo>
          <Tooltip title="Log out" placement="right">
            {/* TODO: error handling for when logging out */}
            <StyledIconButton color="inherit" onClick={onClick}>
              <LogoutRounded />
            </StyledIconButton>
          </Tooltip>
        </>
      )}
    </UserAuth>
  );
};

export default UserAccount;
