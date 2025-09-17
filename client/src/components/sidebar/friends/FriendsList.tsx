import { Search } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Box, styled } from '@mui/system';
import { useContext, useMemo, useState } from 'react';

import { AppContext } from '../../../context/AppContext';
import Friend from './Friend';
import friendList from './friends.json';

const FriendsListContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const StyledSearchButton = styled(IconButton)`
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 8px;
  justify-content: space-around;
  padding: 12px;
`;

const FriendsList = () => {
  const [searchVal, setSearchVal] = useState('');
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(AppContext);

  // TODO: implement fuzzy search
  const renderedFriends = useMemo(() => {
    // TODO: replace hard coded data with integration with server
    const filteredFriends = friendList.filter((friend) => friend.toLowerCase().includes(searchVal));
    return filteredFriends.map((friend, index) => <Friend key={index} firstName={friend} />);
  }, [searchVal]);

  const handleClickSearchBarIcon = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      // TODO: put form search in focus
    }
  };

  return (
    <FriendsListContainer>
      {sidebarCollapsed ? (
        <StyledSearchButton onClick={handleClickSearchBarIcon}>
          <Search />
        </StyledSearchButton>
      ) : (
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
      )}
      {renderedFriends}
    </FriendsListContainer>
  );
};

export default FriendsList;
