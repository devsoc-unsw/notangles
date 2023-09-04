import { Description, Info, Security, Settings as SettingsIcon, HelpRounded } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useState } from 'react';

import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import About from './About';
import Changelog from './Changelog';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';
import Support from './Support';

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
  const { term, termName, year } = useContext(AppContext);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <NavbarBox>
      <StyledNavBar enableColorOnDark position="fixed">
        <Toolbar>
          <LogoImg
            src={currLogo}
            alt="Notangles logo"
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
          <NavbarTitle variant="h6">
            Notangles
            <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak>
          </NavbarTitle>

          <CustomModal
            title="Support"
            showIcon={<HelpRounded />}
            description={'Support'}
            content={<Support />}
          />

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
