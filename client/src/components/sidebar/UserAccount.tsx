import { AccountCircle, LoginRounded, LogoutRounded } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { API_URL } from '../../api/config';
import StyledDialog from '../StyledDialog';

interface UserAccountProps {
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

interface User {
  zid: string;
}
const UserAccount: React.FC<UserAccountProps> = ({ collapsed }) => {
  const [login, setLogin] = useState(false);
  const [windowLocation, setWindowLocation] = useState('');
  const [user, setUser] = useState<User>({ zid: '' });
  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    async function runAsync() {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') {
          setLogin(true);
          setUser({ zid: JSON.parse(userResponse) });
        } else {
          setUser({ zid: '' });
          setLogin(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    runAsync();
  }, []);
  const loginCall = async () => {
    setWindowLocation(window.location.href);
    try {
      window.location.replace(`${API_URL.server}/auth/login`);
    } catch (error) {
      console.log(error);
    }
  };
  const logoutCall = async () => {
    try {
      await fetch(`${API_URL.server}/auth/logout`, {
        credentials: 'include',
      });
    } catch (error) {
      console.log(error);
    }
    window.location.replace(windowLocation);
    setUser({ zid: '' });
  };
  if (!login) {
    return collapsed ? (
      <Tooltip title="Log in" placement="right">
        <StyledIconButton onClick={loginCall}>
          <LoginRounded />
        </StyledIconButton>
      </Tooltip>
    ) : (
      <StyledButton onClick={loginCall}>Log in</StyledButton>
    );
  }

  return (
    <>
      <StyledDialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        onConfirm={() => {
          logoutCall();
          setLogoutDialog(false);
        }}
        title="Confirm Log out"
        content="Are you sure you want to log out?"
        confirmButtonText="Log out"
      />
      <UserAuth>
        {collapsed ? (
          <Tooltip title="Log out" placement="right">
            <StyledIconButton onClick={() => setLogoutDialog(true)}>
              <LogoutRounded />
            </StyledIconButton>
          </Tooltip>
        ) : (
          <>
            <UserInfo>
              <StyledAccountIcon />
              {/* TODO: handle user's name */}
              <p>{user.zid}</p>
            </UserInfo>
            <Tooltip title="Log out" placement="right">
              {/* TODO: error handling for when logging out */}
              <StyledIconButton color="inherit" onClick={logoutCall}>
                <LogoutRounded />
              </StyledIconButton>
            </Tooltip>
          </>
        )}
      </UserAuth>
    </>
  );
};

export default UserAccount;
