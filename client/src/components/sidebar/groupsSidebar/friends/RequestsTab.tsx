import React from 'react';
import { User } from '../GroupsSidebar';
import UserProfile from './UserProfile';
import styled from '@emotion/styled';
import { IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

const StyledFriendsListContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledFriendContainer = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const StyledActionButtons = styled('div')`
  display: flex;
  gap: 12px;
`;

const RequestsTab: React.FC<{ user: User | undefined }> = ({ user }) => {
  if (!user) return;

  return (
    <StyledFriendsListContainer>
      {user.incoming.map((friend: User, i) => (
        <StyledFriendContainer>
          <UserProfile
            key={i}
            firstname={friend.firstname}
            lastname={friend.lastname}
            email={friend.email}
            profileURL={friend.profileURL}
          />
          <StyledActionButtons>
            <IconButton>
              <Check />
            </IconButton>
            <IconButton>
              <Close />
            </IconButton>
          </StyledActionButtons>
        </StyledFriendContainer>
      ))}
    </StyledFriendsListContainer>
  );
};

export default RequestsTab;
