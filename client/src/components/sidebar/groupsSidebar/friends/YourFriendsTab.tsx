import styled from '@emotion/styled';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

import { API_URL } from '../../../../api/config';
import NetworkError from '../../../../interfaces/NetworkError';
import { User } from '../../UserAccount';
import UserProfile from './UserProfile';

const StyledContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledItem = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const YourFriendsTab: React.FC<{ user: User; fetchUserInfo: (userID: string) => void }> = ({ user, fetchUserInfo }) => {
  const handleRemoveFriend = async (friendID: string) => {
    try {
      const res = await fetch(`${API_URL.server}/friend`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.userID,
          sendeeId: friendID,
        }),
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const acceptRequestStatus = await res.json();
      console.log('unfriend status', acceptRequestStatus);
      fetchUserInfo(user.userID);
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  return (
    <StyledContainer>
      {user.friends.map((friend: User, i) => (
        <StyledItem>
          <UserProfile
            key={i}
            firstname={friend.firstname}
            lastname={friend.lastname}
            email={friend.email}
            profileURL={friend.profileURL}
          />
          <Tooltip title="Remove Friend">
            <IconButton onClick={() => handleRemoveFriend(friend.userID)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </StyledItem>
      ))}
      {user.friends.length === 0 && <div>You currently have no friends.</div>}
    </StyledContainer>
  );
};

export default YourFriendsTab;
