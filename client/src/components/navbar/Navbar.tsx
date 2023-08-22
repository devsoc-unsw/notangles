import React, { useContext, useState } from 'react';
import { Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import { styled } from '@mui/system';

import notanglesLogo from '../../assets/notangles_1.png';
import notanglesLogoGif from '../../assets/notangles.gif';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';

import About from './About';
import Changelog from './Changelog';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -11.5px;
`;

const NavbarBox = styled('div')`
  flex-grow: 1;
  position: fixed;
  margin-left: 0px;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */
`;

const StyledNavBar = styled(AppBar)`
  background: ${({ theme }) => theme.palette.primary.main};
  z-index: 1201;
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

const Navbar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const { term, termName, year, setTermName, termNames } = useContext(AppContext);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const selectTerm = (e: any) => {
    // need to handle selecting that corresponding term n reloading term data/resetting timetable?
    setTermName(e.target.value.split(', ')[0]);
  }

  return (
    <NavbarBox>
      <StyledNavBar enableColorOnDark position="fixed">
        <Toolbar>
          <LogoImg
            src={currLogo}
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
          <NavbarTitle variant="h6">
            Notangles
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Age</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={isMobile ? term : termName.concat(', ', year)}
                label="terms"
                onChange={selectTerm}
              >
                {
                  termNames.map((term, index) => {
                    return <MenuItem key={index} value={term.concat(', ', year)}>{term.concat(', ', year)}</MenuItem>;
                  })
                }
              </Select>
            </FormControl>
            {/* <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak> */}
          </NavbarTitle>
          <CustomModal
            title="About"
            showIcon={<Info />}
            description={'Notangles: no more timetable tangles'}
            content={<About />}
          />
          <CustomModal title="Changelog" showIcon={<Description />} description={'Changelog'} content={<Changelog />} />
          <CustomModal
            title="Privacy"
            showIcon={<Security />}
            description={'Application Privacy Statement'}
            content={<Privacy />}
          />
          <CustomModal title="Settings" showIcon={<SettingsIcon />} description={'Settings'} content={<Settings />} />
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  );
};

export default Navbar;
