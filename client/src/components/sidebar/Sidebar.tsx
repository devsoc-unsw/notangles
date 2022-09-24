import * as React from 'react';
import { useState, useContext } from 'react';
import {
  Button,
  Box,
  Divider,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  Typography,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import Help from './Help';
import AddFriends from './AddFriends';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import FaceIcon from '@mui/icons-material/Face';
import { styled } from '@mui/system';
import { AppContext } from '../../context/AppContext';
import CustomModal from './CustomModal';

import notanglesLogo from '../../assets/notangles_1.png';
import notanglesLogoGif from '../../assets/notangles.gif';
import AddFriendsButton from './AddFriendsButton';

const drawerWidth = 250;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -11.5px;
`;

const NavbarTitle = styled(Typography)`
  flex-grow: 1;
  z-index: 1201;
`;

const Weak = styled('span')`
  font-weight: 300;
  opacity: 0.8;
  margin-left: 15px;
  font-size: 90%;
  vertical-align: middle;
  position: relative;
  bottom: 1px;
  z-index: 1201;
`;

export default function Sidebar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const { term, termName, year } = useContext(AppContext);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: '#4074FC' }} disableGutters={true} />
      <Box sx={{ backgroundColor: '#4074FC' }}>
        <LogoImg src={currLogo} onMouseOver={() => setCurrLogo(notanglesLogoGif)} onMouseOut={() => setCurrLogo(notanglesLogo)} />
        <NavbarTitle variant="h6">
          Notangles
          <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak>
        </NavbarTitle>
      </Box>
      <Divider />
      <Typography>Friends</Typography>
      <List>
        {['Grandpa MJ', 'Grace Kan', 'Friend 3', 'Friend 4'].map((text, index) => (
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
      <AddFriendsButton />

      <Divider />
      <Help />
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            borderRadius: '50',
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
