import { Autocomplete, Box, TextField } from '@mui/material';
import { User } from '../GroupsSidebar';
import UserProfile from './UserProfile';
import styled from '@emotion/styled';

const StyledFriendsListContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface UserSearchType {
  zid: string;
  firstname: string;
  lastname: string;
  email: string;
  profileURL: string;
}

const get_all_users = (): UserSearchType[] => {
  return [
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
    {
      zid: 'z5555555',
      firstname: 'Jasmine',
      lastname: 'Tran',
      email: 'raysbae@gmail.com',
      profileURL: 'https://pbs.twimg.com/media/FysPI22WcAg9tfz.jpg',
    },
  ];
};

const AddAFriendTab: React.FC<{ user: User | undefined }> = ({ user }) => {
  if (!user) return;
  console.log('user', user);

  return (
    <Autocomplete
      id="user_search"
      sx={{ width: '100%' }}
      options={get_all_users()}
      autoHighlight
      getOptionLabel={(user) => `${user.firstname} ${user.lastname}`}
      renderOption={(props, user) => {
        const { key, ...optionProps } = props;
        return (
          <Box key={key} component="li" sx={{ '& > img': { borderRadius: 1, mr: 2, flexShrink: 0 } }} {...optionProps}>
            <img loading="lazy" width="20" srcSet={user.profileURL} src={user.profileURL} alt="" />
            {user.firstname} {user.lastname} ({user.zid})
          </Box>
        );
      }}
      renderInput={(params) => <TextField {...params} label="Search for users..." />}
    />
  );
};

export default AddAFriendTab;
