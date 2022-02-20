import React from 'react';

import styled from 'styled-components';
import { StylesProvider, useTheme } from '@material-ui/styles'; // make styled components styling have priority

import { useMediaQuery } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import { ThemeType } from '../constants/theme';

import About from './About';
import Settings from './Settings';
import CSESocLogo from '../assets/notangles_one_n_with_grey.png';
import { year, termName, isPreview, term } from '../constants/timetable';

const LogoImg = styled.img`
  height: 40px;
  margin-right: 20px;
  margin-left: ${isPreview ? 20 : 0}px;
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
  width: 40px;
  height: 40px;
`;
const DarkModeIcon = styled(Brightness2Icon)`
  transform: rotate(180deg);
  color: #bde0ff;
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
  setIsDarkMode(mode: boolean): void;
  isDarkMode: boolean;
  handleDrawerOpen(): void;
  setIsSquareEdges(mode: boolean): void;
  isSquareEdges: boolean;
  setIs12HourMode(mode: boolean): void;
  is12HourMode: boolean;
}

// beware memo - if a component isn't re-rendering, it could be why
const Navbar: React.FC<NavBarProps> = ({ setIsDarkMode, isDarkMode, handleDrawerOpen, setIsSquareEdges, isSquareEdges, setIs12HourMode, is12HourMode }) => {
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StylesProvider injectFirst>
      <NavbarBox>
        <StyledNavBar>
          <Toolbar>
            {isPreview && (
              <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            <LogoImg src={CSESocLogo} />
            <NavbarTitle variant="h6">
              Notangles
              <Weak>
                {!isMobile && <Beta>Beta</Beta>}
                {isMobile ? term : termName.concat(', ', year)}
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
            <About />
            <Settings
              isSquareEdges={isSquareEdges}
              setIsSquareEdges={setIsSquareEdges}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              is12HourMode={is12HourMode}
              setIs12HourMode={setIs12HourMode}
            />
          </Toolbar>
        </StyledNavBar>
      </NavbarBox>
    </StylesProvider>
  );
};

export default Navbar;
