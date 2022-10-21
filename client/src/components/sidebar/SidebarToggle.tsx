import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { Divider } from '@mui/material';
import Help from './Help';
import AddFriendsButton from './AddFriendsButton';
import Navbar from '../navbar/Navbar';
import Friends from './Friends';
import Profile from './Profile';
import styled from '@mui/material/styles/styled';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../context/AuthContext';

const StyledFriends = styled(Friends)`
  margin-top: 20px;
  height: 10vh;
  overflow-y: scroll;
`;

/**
 * Keyframe animation to spin
 */
const ScuffedLoadingSpinner = styled('div')`
  animation: spin 1s linear infinite;
  z-index: 1201;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function FadeMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { user, loading, signIn, signOut } = useAuth();
  console.log(user);

  const buildUser = () => {
    if (loading) {
      return <ScuffedLoadingSpinner>Loading...</ScuffedLoadingSpinner>;
    } else if (user) {
      return <Avatar alt={user.name} src={user.picture} sx={{ width: 32, height: 32, marginLeft: 1 }} onClick={signOut} />;
    } else {
      return (
        <Button variant="contained" color="secondary" onClick={signIn} sx={{ marginLeft: 1 }}>
          Sign In
        </Button>
      );
    }
  };

  return (
    <div>
      <Button
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Navbar />
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {buildUser()}
        <Divider />
        <MenuItem>Friends</MenuItem>
        <StyledFriends />
        <MenuItem>
          <AddFriendsButton />
        </MenuItem>
        <Divider />
        <Help />
      </Menu>
    </div>
  );
}
