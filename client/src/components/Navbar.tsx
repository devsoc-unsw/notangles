import React, { FunctionComponent } from 'react';

import styled from 'styled-components';
import { StylesProvider } from '@material-ui/styles'; // make styled components styling have priority

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import About from './About';

import CSESocLogo from '../assets/notangles_one_n_with_grey.png';

const LogoImg = styled.img`
  height: 40px;
  margin-right: 20px;
  margin-left: 20px;
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
  border-radius:40px;
  margin-right: 20px;
  width:40px;
  height: 40px;
`;
const DarkModeIcon = styled(Brightness2Icon)`
  transform: rotate(180deg);
  color: #bde0ff;
`;
const NavButton = styled(Button)`
  margin-right: 20px;
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
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <LogoImg src={CSESocLogo} />
          <NavbarTitle variant="h6">
            Notangles
          </NavbarTitle>

          <DarkModeButton
            value={isDarkMode}
            selected={isDarkMode}
            onChange={() => {
              setIsDarkMode(!isDarkMode);
            }}
          >
            <DarkModeIcon fontSize="small" />
          </DarkModeButton>

          <NavButton color="inherit">
            <Link
              href="https://forms.gle/rV3QCwjsEbLNyESE6"
              target="_blank"
              underline="none"
              color="inherit"
            >
              Feedback
            </Link>
          </NavButton>

          <About />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  </StylesProvider>
));

export default Navbar;
