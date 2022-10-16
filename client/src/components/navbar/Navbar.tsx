import React, { useContext, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Button, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

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
  font-size: 92%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Weak = styled('span')`
  font-weight: 300;
  opacity: 0.8;
  margin-left: 15px;
  font-size: 90%;
  vertical-align: middle;
  position: relative;
  z-index: 1201;
`;

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

const Navbar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const { term, termName, year } = useContext(AppContext);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, loading, signIn, signOut } = useAuth();

  console.log(user);

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

  return (
    <NavbarBox>
      <StyledNavBar enableColorOnDark position="fixed">
        <Toolbar>
          <MenuIcon />
          <NavbarTitle>
            <LogoImg
              src={currLogo}
              onMouseOver={() => setCurrLogo(notanglesLogoGif)}
              onMouseOut={() => setCurrLogo(notanglesLogo)}
            />
            Notangles
            <Weak>{isMobile ? term : termName.concat(', ', year)}</Weak>
          </NavbarTitle>
        </Toolbar>
      </StyledNavBar>
    </NavbarBox>
  );
};

export default Navbar;
