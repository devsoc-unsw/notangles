import { Autocomplete, Box, Button, IconButton, TextField, Tooltip } from '@mui/material';
import { User } from '../GroupsSidebar';
import UserProfile from './UserProfile';
import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { API_URL } from '../../../../api/config';
import NetworkError from '../../../../interfaces/NetworkError';

interface UserSearchType {
  userID: string;
  firstname: string;
  lastname: string;
  email: string;
  profileURL: string;
}

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

const get_all_users = (): UserSearchType[] => {
  return [
    {
      userID: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      userID: 'z5555554',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
  ];
};

const AddAFriendTab: React.FC<{ user: User | undefined; getUserInfo: () => void }> = ({ user, getUserInfo }) => {
  if (!user) return;

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
      <TextField label="Search for a friend..." variant="outlined" fullWidth />
      <StyledUsersContainer>
        {get_all_users().map((otherUser: UserSearchType) => {
          return (
            <StyledItem>
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
          );
        })}
      </StyledUsersContainer>
    </StyledContainer>
    // <Autocomplete
    //   id="user_search"
    //   sx={{ width: '100%' }}
    //   options={get_all_users()}
    //   autoHighlight
    //   getOptionLabel={(user) => `${user.firstname} ${user.lastname}`}
    //   renderOption={(props, user) => {
    //     const { key, ...optionProps } = props;
    //     return (
    //       <Box key={key} component="li" sx={{ '& > img': { borderRadius: 1, mr: 2, flexShrink: 0 } }} {...optionProps}>
    //         <SearchItemContainer>
    //           <UserProfile
    //             firstname={user.firstname}
    //             lastname={user.lastname}
    //             email={user.email}
    //             profileURL={user.profileURL}
    //           />
    //         </SearchItemContainer>
    //       </Box>
    //     );
    //   }}
    //   renderInput={(params) => <TextField {...params} label="Search for users..." />}
    // />
  );
};

export default AddAFriendTab;
