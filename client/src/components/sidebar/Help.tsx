import React from 'react';

import { styled } from '@mui/system';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

import About from '../sidebar/About';
import Changelog from '../sidebar/Changelog';
import Privacy from '../sidebar/Privacy';
import Settings from '../sidebar/Settings';
import CustomModal from './CustomModal';

import SettingsIcon from '@mui/icons-material/Settings';
import Info from '@mui/icons-material/Info';
import Security from '@mui/icons-material/Security';
import Description from '@mui/icons-material/Description';

const Help = () => {
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Settings" />
          <CustomModal title="Settings" showIcon={<SettingsIcon />} description={'Settings'} content={<Settings />} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="About" />
          <CustomModal title="About" showIcon={<Info />} description={'About'} content={<About />} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Changelog" />
          <CustomModal title="Changelog" showIcon={<Description />} description={'Changelog'} content={<Changelog />} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Privacy" />
          <CustomModal title="Privacy" showIcon={<Security />} description={'Privacy'} content={<Privacy />} />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default Help;
