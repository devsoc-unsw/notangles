// No Longer Used

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
import Avatar from '@mui/material/Avatar';

import notanglesLogo from '../../assets/notangles_1.png';
import notanglesLogoGif from '../../assets/notangles.gif';
import AddFriendsButton from './AddFriendsButton';
import { useAuth } from '../../context/AuthContext';

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

const StyledDrawer = styled(Drawer)`
  border-radius: 100px;
`;

const StyledDivider = styled(Divider)`
  margin-top: 100px;
`;

const StyledAddFriendsButton = styled(AddFriendsButton)`
  margin-top: 100px;
  alignq-self: center;
`;

const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0;
`;

export default function Sidebar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const { term, termName, year } = useContext(AppContext);
  const { user, loading, signIn, signOut } = useAuth();

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

  const drawer = (
    <div>
      {/* <StyledToolbar sx={{ backgroundColor: '#4074FC' }} disableGutters={true} /> */}
      <StyledDivider />
      {buildUser()}
      <Typography variant="h6" align="justify">
        Friends
      </Typography>
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
      <StyledAddFriendsButton />

      <StyledDivider />
      <Help />
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <StyledDrawer
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
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>
    </Box>
  );
}
