import React, { FunctionComponent } from 'react';

import styled from 'styled-components';
import { StylesProvider } from '@material-ui/styles'; // make styled components styling have priority

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import FeedbackIcon from '@material-ui/icons/ChatBubble';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Tooltip from '@material-ui/core/Tooltip';

import About from './About';
import Settings from './Settings';
import CSESocLogo from '../assets/notangles_one_n_with_grey.png';
import { year, termName } from '../constants/timetable';

const LogoImg = styled.img`
  height: 40px;
  margin-right: 20px;
  margin-left: ${process.env.REACT_APP_SHOW_PREVIEW === 'true' ? 20 : 0}px;
`;
const NavbarBox = styled.div`
  flex-grow: 1;
  position: fixed;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */
`;
const StyledNavBar = styled(AppBar)`
  position: fixed;
`;
const NavbarTitle = styled(Typography)`
  flex-grow: 1;
`;

const DarkModeButton = styled(ToggleButton)`
  border: none;
  border-radius: 40px;
  margin-right: 5px;
  width:40px;
  height: 40px;
`;
const DarkModeIcon = styled(Brightness2Icon)`
  transform: rotate(180deg);
  color: #bde0ff;
`;
const NavLink = styled(Link)`
  margin-right: 5px;
`;

const Weak = styled.span`
  font-weight: 300;
  opacity: 0.8;
  margin-left: 15px;
  font-size: 90%;
  vertical-align: middle;
  position: relative;
  bottom: 1px;
`;

const Beta = styled.span`
  font-weight: 500;
  opacity: 0.8;
  margin-left: -8.5px;
  margin-right: 20px;
  font-size: 80%;
  vertical-align: bottom;
  position: relative;
  bottom: -5px;
`;

interface NavBarProps {
  setIsDarkMode(mode: boolean): void,
  isDarkMode: boolean,
  handleDrawerOpen(): void,
}

const Navbar: FunctionComponent<NavBarProps> = React.memo(({
  setIsDarkMode,
  isDarkMode,
  handleDrawerOpen,
}) => (
  <StylesProvider injectFirst>
    <NavbarBox>
      <StyledNavBar>
        <Toolbar>
          {process.env.REACT_APP_SHOW_PREVIEW === 'true' && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
          )}
          <LogoImg src={CSESocLogo} />
          <NavbarTitle variant="h6">
            Notangles
            <Weak>
              <Beta>
                BETA
              </Beta>
              {termName}
              {', '}
              {year}
            </Weak>
          </NavbarTitle>

          <Tooltip title="Toggle dark mode">
            <DarkModeButton
              value={isDarkMode}
              selected={isDarkMode}
              onChange={() => {
                setIsDarkMode(!isDarkMode);
              }}
            >
              <DarkModeIcon fontSize="small" />
            </DarkModeButton>
          </Tooltip>

          <Tooltip title="Give feedback">
            <NavLink
              href="https://forms.gle/rV3QCwjsEbLNyESE6"
              target="_blank"
              color="inherit"
            >
              <IconButton color="inherit">
                <FeedbackIcon />
              </IconButton>
            </NavLink>
          </Tooltip>

          <About />
          <Settings />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  </StylesProvider>
));

export default Navbar;
