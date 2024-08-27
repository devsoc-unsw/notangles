import React from 'react';
import { User } from '../GroupsSidebar';
import UserProfile from './UserProfile';
import styled from '@emotion/styled';

const StyledFriendsListContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const YourFriendsTab: React.FC<{ user: User | undefined }> = ({ user }) => {
  if (!user) return;

  return (
    <StyledFriendsListContainer>
      {user.friends.map((friend: User, i) => (
        <UserProfile
          key={i}
          firstname={friend.firstname}
          lastname={friend.lastname}
          email={friend.email}
          profileURL={friend.profileURL}
        />
      ))}
    </StyledFriendsListContainer>
  );
};

export default YourFriendsTab;
