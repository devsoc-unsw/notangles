import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { AppBar, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Menu } from '@mui/icons-material';

import CSESocLogo from '../assets/notangles_one_n_with_grey.png';
import CSESocLogoTwo from '../assets/notangles_two_n_with_grey.gif';
import { ThemeType } from '../constants/theme';
import { isPreview, term, termName, year } from '../constants/timetable';
import { AppContext } from '../context/AppContext';

import About from './About';
import Privacy from './Privacy';
import Settings from './Settings';
import Changelog from './Changelog';

const LogoImg = styled.img`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: ${isPreview ? 9.5 : -11.5}px;
`;

const NavbarBox = styled.div`
  flex-grow: 1;
  position: fixed;
  margin-left: 0px;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */
`;

const StyledNavBar = styled(AppBar)`
  position: fixed;
`;

const NavbarTitle = styled(Typography)`
  flex-grow: 1;
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

const Navbar: React.FC = () => {
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isFriendsListOpen, setIsFriendsListOpen } = useContext(AppContext);

  const handleDrawerOpen = () => {
    setIsFriendsListOpen(!isFriendsListOpen);
  };

  const [currLogo, setCurrLogo] = useState(CSESocLogo);

  return (
    // <StylesProvider injectFirst>
    <NavbarBox>
      <StyledNavBar>
        <Toolbar>
          {isPreview && (
            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" size="large">
              <Menu />
            </IconButton>
          )}
          <LogoImg src={currLogo} onMouseOver={() => setCurrLogo(CSESocLogoTwo)} onMouseOut={() => setCurrLogo(CSESocLogo)} />
          <NavbarTitle variant="h6">
            Notangles
            <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak>
          </NavbarTitle>
          <About />
          <Changelog />
          <Privacy />
          <Settings />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
    // </StylesProvider>
  );
};

export default Navbar;
