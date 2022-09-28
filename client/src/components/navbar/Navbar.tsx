import React, { useContext, useState } from 'react';
import { Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';

import notanglesLogo from '../../assets/notangles_1.png';
import notanglesLogoGif from '../../assets/notangles.gif';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';

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
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
          <NavbarTitle variant="h6">
            Notangles
            <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak>
          </NavbarTitle>
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  );
};

export default Navbar;
