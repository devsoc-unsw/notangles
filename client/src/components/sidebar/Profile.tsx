import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';

const Profile = () => {
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            {' '}
            <FaceIcon />
          </ListItemIcon>
          <ListItemText primary="Username" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default Profile;
