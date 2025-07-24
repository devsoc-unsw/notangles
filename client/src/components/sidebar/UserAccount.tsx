import { LoginRounded, LogoutRounded } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';
import { API_URL } from '../../api/config';
import storage from '../../utils/storage';
import { createDefaultTimetable } from '../../utils/timetableHelpers';
import StyledDialog from '../StyledDialog';
import UserProfile from './friends/UserProfile';

interface UserAccountProps {
  collapsed: boolean;
}

const UserAuth = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  min-width: 200px;
  min-height: 40px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
`;

const ExpandedContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
`;

const UserAccount: React.FC<UserAccountProps> = ({ collapsed }) => {
  const [windowLocation, setWindowLocation] = useState('');
  const [logoutDialog, setLogoutDialog] = useState(false);

  const loginCall = async () => {
    setWindowLocation(window.location.href);
    try {
      window.location.href = `${API_URL.server}/auth/login`;
    } catch (error) {
      console.log(error);
    }
  };

  const user = {
    userID: '',
    firstname: 'First',
    lastname: 'Last',
    email: 'example@user.com',
    profileURL: '',
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
    storage.set('timetables', createDefaultTimetable(undefined));
  };
  if (!user.userID) {
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
        onClose={() => {
          setLogoutDialog(false);
        }}
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
            <StyledIconButton
              onClick={() => {
                setLogoutDialog(true);
              }}
            >
              <LogoutRounded />
            </StyledIconButton>
          </Tooltip>
        ) : (
          <ExpandedContainer>
            <UserProfile
              firstname={user.firstname}
              lastname={user.lastname}
              email={user.email}
              profileURL={user.profileURL}
            />
            <Tooltip title="Log out" placement="right">
              {/* TODO: error handling for when logging out */}
              <StyledIconButton color="inherit" onClick={logoutCall}>
                <LogoutRounded />
              </StyledIconButton>
            </Tooltip>
          </ExpandedContainer>
        )}
      </UserAuth>
    </>
  );
};

export default UserAccount;
