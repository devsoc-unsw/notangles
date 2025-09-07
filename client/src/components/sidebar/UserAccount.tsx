import { LogoutRounded } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { API_URL } from '../../api/config';
import { useAuth } from '../../hooks/useAuth';
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

const ExpandedContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
`;

const UserAccount: React.FC<UserAccountProps> = ({ collapsed }) => {
  const [logoutDialog, setLogoutDialog] = useState(false);
  const { user } = useAuth();

  const onLogout = () => {
    window.location.href = `${API_URL.server}/auth/logout`;
  };

  // Shouldn't be possible;
  if (!user) {
    return <></>;
  }

  return (
    <>
      <StyledDialog
        open={logoutDialog}
        onClose={() => {
          setLogoutDialog(false);
        }}
        onConfirm={() => {
          onLogout();
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
            <UserProfile firstName={user.firstName} lastName={user.lastName} profileURL={user.profilePictureUrl} />
            <Tooltip title="Log out" placement="right">
              {/* TODO: error handling for when logging out */}
              <StyledIconButton color="inherit" onClick={onLogout}>
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
