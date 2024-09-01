import styled from '@emotion/styled';
import { Check, Close } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

import { API_URL } from '../../../../api/config';
import NetworkError from '../../../../interfaces/NetworkError';
import { User } from '../../UserAccount';
import UserProfile from './UserProfile';

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

const RequestsTab: React.FC<{ user: User | undefined; getUserInfo: () => void }> = ({ user, getUserInfo }) => {
  if (!user) return <></>;

  const handleDeclineRequest = async (incomingUserId: string) => {
    try {
      const res = await fetch(`${API_URL.server}/friend/request`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sendeeId: user.userID,
          senderId: incomingUserId,
        }),
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const declineRequestStatus = await res.json();
      console.log('decline request status', declineRequestStatus);
      getUserInfo();
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  const handleAcceptRequest = async (incomingUserId: string) => {
    try {
      const res = await fetch(`${API_URL.server}/friend`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.userID,
          sendeeId: incomingUserId,
        }),
      });
      if (res.status !== 201) throw new NetworkError("Couldn't get response");
      const acceptRequestStatus = await res.json();
      console.log('accept request status', acceptRequestStatus);
      getUserInfo();
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  return (
    <StyledFriendsListContainer>
      {user.incoming.map((friend: User, i: number) => (
        <StyledFriendContainer>
          <UserProfile
            key={i}
            firstname={friend.firstname}
            lastname={friend.lastname}
            email={friend.email}
            profileURL={friend.profileURL}
          />
          <StyledActionButtons>
            <Tooltip title="Accept Request">
              <IconButton onClick={() => handleAcceptRequest(friend.userID)}>
                <Check />
              </IconButton>
            </Tooltip>
            <Tooltip title="Decline Request">
              <IconButton onClick={() => handleDeclineRequest(friend.userID)}>
                <Close />
              </IconButton>
            </Tooltip>
          </StyledActionButtons>
        </StyledFriendContainer>
      ))}
      {user.incoming.length === 0 && <div>You have no friend requests.</div>}
    </StyledFriendsListContainer>
  );
};

export default RequestsTab;
