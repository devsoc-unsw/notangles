import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';

const Friends = () => {
  return (
    <List>
      {['Grandpa MJ', 'Grace Kan', 'Pikachu Smith', 'Friend4', 'Friend6', 'Friend7'].map((text, index) => (
        <ListItem key={text} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              {' '}
              <FaceIcon />
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Friends;
