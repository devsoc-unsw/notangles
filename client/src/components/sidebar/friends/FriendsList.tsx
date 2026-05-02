import { Search } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Box, styled } from '@mui/system';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { useFriendsQuery } from '../../../api/friendship/queries';
import { FriendInfo } from '../../../interfaces/User';
import Friend from './Friend';

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

const FriendsList = ({
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
}) => {
  const [searchVal, setSearchVal] = useState('');
  const friendList = useFriendsQuery();

  const fuse = useMemo(() => {
    return new Fuse<FriendInfo>(friendList, { threshold: 0.4, keys: ['firstName', 'lastName'] });
  }, [friendList]);

  const friends = searchVal.length === 0 ? friendList : fuse.search(searchVal).map((result) => result.item);

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
      {friends.map((friend) => (
        <Friend
          key={friend.id}
          sidebarCollapsed={sidebarCollapsed}
          id={friend.id}
          firstName={friend.firstName}
          lastName={friend.lastName}
          profilePictureUrl={friend.profilePictureUrl}
        />
      ))}
    </FriendsListContainer>
  );
};

export default FriendsList;
