import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { User } from '../GroupsSidebar';
import UserProfile from './UserProfile';
import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { API_URL } from '../../../../api/config';
import NetworkError from '../../../../interfaces/NetworkError';
import { useEffect, useState } from 'react';

const StyledContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledUsersContainer = styled('div')`
  display: flex;
  flex-direction: column;
`;

const StyledItem = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 8px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const AddAFriendTab: React.FC<{ user: User | undefined; getUserInfo: () => void }> = ({ user, getUserInfo }) => {
  if (!user) return <></>;

  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getNonFriendUsers = async () => {
    try {
      const res = await fetch(`${API_URL.server}/user/all`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const getUsersStatus = await res.json();
      console.log('get all users request status', getUsersStatus);
      const allUsers = getUsersStatus.data;
      const excludingLoggedUser = allUsers.filter((userData: User) => userData.userID !== user.userID);
      const nonFriendUsers = excludingLoggedUser.filter(
        (userData: User) => !user.friends.map((friend) => friend.userID).includes(userData.userID),
      );
      setOtherUsers(nonFriendUsers);
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  useEffect(() => {
    getNonFriendUsers();
  }, [user]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = otherUsers.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendRequest = async (otherUserID: string) => {
    try {
      const res = await fetch(`${API_URL.server}/friend/request`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.userID,
          sendeeId: otherUserID,
        }),
      });
      if (res.status !== 201) throw new NetworkError("Couldn't get response");
      const acceptRequestStatus = await res.json();
      console.log('send request status', acceptRequestStatus);
      getUserInfo();
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  const handleCancelRequest = async (otherUserID: string) => {
    try {
      const res = await fetch(`${API_URL.server}/friend/request`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sendeeId: otherUserID,
          senderId: user.userID,
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

  return (
    <StyledContainer>
      <TextField
        label="Search for a friend..."
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <StyledUsersContainer>
        {filteredUsers.map((otherUser) => (
          <StyledItem key={otherUser.userID}>
            <UserProfile
              firstname={otherUser.firstname}
              lastname={otherUser.lastname}
              email={otherUser.email}
              profileURL={otherUser.profileURL}
            />
            {user.outgoing.map((userRequested) => userRequested.userID).includes(otherUser.userID) ? (
              <Button sx={{ textTransform: 'none' }} onClick={() => handleCancelRequest(otherUser.userID)}>
                <div style={{ fontStyle: 'italic', color: 'grey' }}>Requested</div>
              </Button>
            ) : (
              <Tooltip title="Send Friend Request">
                <IconButton onClick={() => handleSendRequest(otherUser.userID)}>
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          </StyledItem>
        ))}
        {otherUsers.length === 0 && <div>You are friends with everyone! There is no one else to add.</div>}
      </StyledUsersContainer>
    </StyledContainer>
  );
};

export default AddAFriendTab;
