import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Box, Grid, styled } from '@mui/system';
import { useMemo, useState } from 'react';

import Friend from './Friend';
import friendList from './friends.json';

const FriendsListContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const FriendsList = () => {
  const [searchVal, setSearchVal] = useState('');

  // TODO: implement fuzzy search
  const renderedFriends = useMemo(() => {
    const filteredFriends = friendList.filter((friend) => friend.toLowerCase().includes(searchVal));
    return filteredFriends.map((friend, index) => (
      <Grid size={12} key={index}>
        <Friend firstName={friend} />
      </Grid>
    ));
  }, [searchVal]);

  return (
    <FriendsListContainer>
      <FormControl fullWidth size="small" margin="normal">
        <InputLabel>Search</InputLabel>
        <OutlinedInput
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          label="Search"
          onChange={(e) => {
            setSearchVal(e.target.value.toLowerCase());
          }}
        />
      </FormControl>
      {renderedFriends}
    </FriendsListContainer>
  );
};

export default FriendsList;
