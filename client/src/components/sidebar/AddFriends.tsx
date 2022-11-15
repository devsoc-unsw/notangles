import { People, PersonAdd, PersonAddDisabled } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Divider, Link, TextField, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/system';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SearchResult, User } from '../../interfaces/Friends';

const ChangeItem = styled('div')`
  padding: 0.5vh 0;
`;

const ChangeTitle = styled('div')`
  font-weight: bold;
  font-size: 1.1rem;
`;

// styling button for add friend
const AddFriendButton = styled(Button)`
  background-color: #3f51b5;
  color: white;
  border-radius: 50px;
  padding: 0.5vh 1.5vw;
  margin-left: 1vw;
  &:hover {
    background-color: #3f51b5;
    color: white;
  }
`;

const UserItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding-top: 1vh;
`;

const UserProfile = styled(Box)`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const SearchBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0;
`;

const SearchButton = styled(Button)`
  color: white;
  border-radius: 100%;
  padding-top: 1.1vw;
  padding-bottom: 1.1vw;
  justify-content: center;
  align-content: center;
  margin-left: 1vw;
  height: 90%;
  &:hover {
    color: grey;
  }
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 0.8vw;
}`;

const ProfileImage = styled('img')`
  width: 2.5vw;
  height: 2.5vw;
  border-radius: 50%;
  margin-right: 0.8vw;
}`;

const AddFriends: React.FC = () => {
  const [userList, setUserList] = useState<SearchResult[]>([]);
  const [search, setSearch] = useState('');
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [recvRequests, setRecvRequests] = useState<User[]>([]);

  const { user, token } = useAuth();
  const { setAlertMsg, setErrorVisibility } = useContext(AppContext);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const getFriendRequests = () => {
    fetch(`/api/friend/request/${user?.sub}`, {
      method: 'get',
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => {
        const { sentReq, recvReq } = data.data;
        setSentRequests(sentReq);
        setRecvRequests(recvReq);
      })
      .catch((err) => {
        setAlertMsg('Failed to get friend requests');
        setErrorVisibility(true);
      });
  };

  // declare a use effect then set the setrequest in the use effect which returns the what we want to render
  useEffect(() => {
    getFriendRequests();
  }, []);

  const sendFriendRequest = (id: string) => {
    const body = {
      senderId: user?.sub,
      sendeeId: id,
    };

    fetch('/api/friend/request', {
      method: 'post',
      headers: headers,
      body: JSON.stringify(body),
    }).then((response) => {
      if (response.status === 200) {
        setUserList(
          userList.map((user) => {
            if (user.user.userId === id) {
              user.hasSentRequest = true;
            }
            return user;
          })
        );
      } else {
        setAlertMsg('Failed to send friend request');
        setErrorVisibility(true);
      }
    });
  };

  const cancelFriendRequest = (id: string) => {
    // create a new friend object
    const body = {
      senderId: user?.sub,
      sendeeId: id,
    };

    fetch('/api/friend/request', {
      method: 'delete',
      headers: headers,
      body: JSON.stringify(body),
    }).then((response) => {
      if (response.status === 200) {
        setUserList(
          userList.map((user) => {
            if (user.user.userId === id) {
              user.hasSentRequest = false;
            }
            return user;
          })
        );
      } else {
        // print out the error message
        setAlertMsg('Failed to cancel friend request');
        setErrorVisibility(true);
      }
    });
  };

  const getAddFriendButton = (u: SearchResult) => {
    const sentRequest = u.hasSentRequest;
    const isFriend = u.isAlreadyFriend;
    if (isFriend) {
      return (
        <Button color="success">
          <People />
        </Button>
      );
    } else if (sentRequest) {
      return (
        <Button variant="outlined" onClick={() => cancelFriendRequest(u.user.userId)}>
          <PersonAddDisabled />
        </Button>
      );
    } else {
      return (
        <Button variant="contained" onClick={() => sendFriendRequest(u.user.userId)}>
          <PersonAdd />
        </Button>
      );
    }
  };

  const searchResults = userList.map((u) => (
    <UserItem key={u.user.userId}>
      <UserProfile>
        <ProfileImage src={u.user.profileURL} />
        {u.user.firstname + ' ' + u.user.lastname}
      </UserProfile>
      {getAddFriendButton(u)}
    </UserItem>
  ));

  const incomingRequests = recvRequests.map((u) => (
    <UserItem>
      <UserProfile>
        <ProfileImage src={u.profileURL} />
        {u.firstname + ' ' + u.lastname}
      </UserProfile>
      <Button variant="contained" color="primary">
        Accept
      </Button>
    </UserItem>
  ));

  console.log(sentRequests);

  const outgoingRequests = sentRequests.map((u) => (
    <UserItem>
      <UserProfile>
        <ProfileImage src={u.profileURL} />
        {u.firstname + ' ' + u.lastname}
      </UserProfile>
      <Button variant="outlined" color="primary">
        Cancel
      </Button>
    </UserItem>
  ));

  // actual search users
  const searchUsers = () => {
    // make a state for search
    const underscoredName = search.replaceAll(' ', '_');
    fetch(`http://localhost:3001/api/friend/search?name=${underscoredName}`, {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          setAlertMsg('User not found');
          setErrorVisibility(true);
        }
      })
      .then((data) => {
        setUserList(data.data);
      });
  };

  return (
    <>
      <Typography gutterBottom variant="body2">
        Add existing friends on Notangles or send them an invite to Notangles, both via their zID. Friends can view each other's
        timetables or collaborate on timetables.
      </Typography>
      <Divider />
      <SearchBox>
        <TextField
          label="Add Friends By Full Name"
          margin="normal"
          fullWidth
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        />
        <SearchButton variant="contained" onClick={searchUsers}>
          <SearchIcon />
        </SearchButton>
      </SearchBox>
      <div>{searchResults}</div>
      <div>Incoming Requests</div>
      <div>{incomingRequests}</div>
      <div>Outgoing Requests</div>
      <div>{outgoingRequests}</div>
    </>
  );
};

export default AddFriends;
