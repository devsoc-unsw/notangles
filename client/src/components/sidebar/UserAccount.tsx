import { LogoutRounded } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext, useState } from 'react';

import { API_URL } from '../../api/config';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import StyledDialog from '../StyledDialog';
import UserProfile from './friends/UserProfile';

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

const ExpandedContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'sidebarCollapsed',
})<{ sidebarCollapsed: boolean }>(({ sidebarCollapsed }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
  width: '100%',
  padding: '10px 6px',
}));

const UserAccount = () => {
  const [logoutDialog, setLogoutDialog] = useState(false);
  const { user } = useAuth();
  const { sidebarCollapsed } = useContext(AppContext);

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
        <ExpandedContainer sidebarCollapsed={sidebarCollapsed}>
          {!sidebarCollapsed && (
            <UserProfile firstName={user.firstName} lastName={user.lastName} profileURL={user.profilePictureUrl} />
          )}
          <Tooltip title="Log out" placement="right">
            <StyledIconButton
              onClick={() => {
                setLogoutDialog(true);
              }}
            >
              <LogoutRounded />
            </StyledIconButton>
          </Tooltip>
        </ExpandedContainer>
      </UserAuth>
    </>
  );
};

export default UserAccount;
