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

const StyledFriends = styled(Friends)`
  margin-top: 20px;
  height: 10vh;
  overflow-y: scroll;
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
        <Profile />
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
