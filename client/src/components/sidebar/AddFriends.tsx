import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Divider, Link, TextField, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/system';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../interfaces/User';
<<<<<<< HEAD
import Avatar from '@mui/material/Avatar';
import { PersonAdd, PersonAddDisabled, People } from '@mui/icons-material';
=======
>>>>>>> af55cfaba59cccf9d0888af9c90f78d3be308972

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

const AddFriends: React.FC = () => {
  const [search, setSearch] = useState('');

  // create fake users implementing User interface
  const fakeUser1: User = {
    user: {
      firstname: 'Woof',
      lastname: 'Lee',
      google_uid: '1000000',
    },
    hasSentRequest: false,
    isAlreadyFriend: false,
  };

  const fakeUser2: User = {
    user: {
      firstname: 'Quack',
      lastname: 'User',
      google_uid: '1000000',
    },
    hasSentRequest: false,
    isAlreadyFriend: true,
  };

  const fakeUser3: User = {
    user: {
      firstname: 'Meow',
      lastname: 'User',
      google_uid: '1000',
    },
    hasSentRequest: true,
    isAlreadyFriend: false,
  };

  const [userList, setUserList] = useState<User[]>([fakeUser1, fakeUser2, fakeUser3]);

  function AddFriendButton(d: User) {
    const sentRequest = d.hasSentRequest;
    const isFriend = d.isAlreadyFriend;
    if (isFriend) {
      return (
        <Button color="success">
          <People />
        </Button>
      );
    } else if (sentRequest) {
      return (
        <Button variant="outlined" onClick={cancelRequest}>
          <PersonAddDisabled />
        </Button>
      );
    } else {
      return (
        <Button variant="contained" onClick={sendRequest}>
          <PersonAdd />
        </Button>
      );
    }
  }

  const listItems = userList.map((d) => (
    <UserItem key={d.user.google_uid}>
      <UserProfile>
        <Avatar>{d.user.firstname.split('')[0].toUpperCase() + d.user.lastname.split('')[0].toUpperCase()}</Avatar>
        {/* to change to back ticks later */}
        {' ' + d.user.firstname + ' ' + d.user.lastname}
      </UserProfile>
      {AddFriendButton(d)}
    </UserItem>
  ));

  // use auth
  const { user, token } = useAuth();

  // // function for adding friends
  // const addFriend = (id: string) => {
  //   // create a new friend object
  //   const body = {
  //     senderId: user?.sub,
  //     receiverId: id,
  //   };
  //   fetch('http://localhost:3001/api/friend/request', { method: 'post', body: JSON.stringify(body) }).then(response);
  // };

  // add friend to user

  // pass search into actual search and return a list of users
  // that match the search

  // actual search users
  const searchUsers = () => {
    // make a state for search
    const underscoredName = search.replaceAll(' ', '_');
    fetch(`http://localhost:3001/api/friend/search?name=${underscoredName}`, {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    })
      .then((response) => response.json())
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
      <div>{listItems}</div>
    </>
  );
};

export default AddFriends;
