import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Box, Grid, styled } from '@mui/system';
import { useMemo, useState } from 'react';

import Friend from './Friend';
import friendList from './friends.json';

const StyledFriendsList = styled(Box)`
  overflow-y: overlay;
  // max-height: calc(100vh - 64px - 64px - 48px - 48px - 235px - 90px);
  max-height: 25vh;
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
    <Grid container spacing={1} sx={{ marginBottom: 2 }}>
      <Grid size={12}>
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
      </Grid>
      <StyledFriendsList>{renderedFriends}</StyledFriendsList>
    </Grid>
  );
};

export default FriendsList;
