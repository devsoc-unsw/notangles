import { Search } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Box, styled } from '@mui/system';
import Fuse from 'fuse.js';
import { useContext, useMemo, useState } from 'react';

import { AppContext } from '../../../context/AppContext';
import Friend, { FriendDTO } from './Friend';
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

  const renderedFriends = useMemo(() => {
    // TODO: replace hard coded data with integration with server
    let friends = friendList;
    if (searchVal.length === 0) {
      return friends.map(({ firstName, lastName, id }) => (
        <Friend key={id as string} firstName={firstName as string} lastName={lastName as string} id={id as string} />
      ));
    }

    const fuzzy = new Fuse<FriendDTO>(friendList, { threshold: 0.4, keys: ['firstName', 'lastName'] });
    friends = fuzzy.search(searchVal).map((result) => result.item);
    return friends.map(({ firstName, lastName, id }) => (
      <Friend key={id as string} firstName={firstName as string} lastName={lastName as string} id={id as string} />
    ));
  }, [searchVal]);

  const handleClickSearchBarIcon = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
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
              setSearchVal(e.target.value.trim().toLowerCase());
            }}
            inputRef={(input: HTMLInputElement | null) => {
              input?.focus();
            }}
          />
        </FormControl>
      )}
      {renderedFriends}
    </FriendsListContainer>
  );
};

export default FriendsList;
