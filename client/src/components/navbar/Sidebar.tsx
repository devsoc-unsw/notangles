import { Description, Info, Security, Settings as SettingsIcon, CalendarToday, People } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { fontWeight, styled } from '@mui/system';
import React, { useState, useRef, useContext } from 'react';
import { BarsArrowUpIcon } from '@heroicons/react/24/outline';
import FooterInfo from '../footer/FooterInfo';
import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import About from './About';
import Changelog from './Changelog';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';
import Tooltip from './Tooltip';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -5.5px;
`;

const NavbarBox = styled('div')`
  flex-grow: 1;
  position: fixed;
  margin-left: 0px;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */
`;

const StyledNavBar = styled(AppBar)`
  background-color: #f8f8f9;
  width: 290px;
  height: 100vh;
  color: #323e4d;
  left: 0;
`;

const StyledNavBarCollapsed = styled(AppBar)`
  background-color: #f8f8f9;
  width: 80px;
  height: 100vh;
  color: #323e4d;
  left: 0;
`;

const NavbarTitle = styled(Typography)`
  font-weight: 700;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-left: -20px;
  align-text: center;
`;

const Weak = styled('span')`
  font-weight: 300;
  opacity: 0.8;
  font-size: 12px;
  vertical-align: middle;
  position: relative;
  bottom: 1px;
  z-index: 1201;
`;

const HeaderContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 19px 10px 19px;
  border-bottom: 1px solid #dadee2;
`;

const SideBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 8px 16px 20px 16px;
  height: 100%;
`;

const NavComponentsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const NavBarFooter = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 16px;
  font-size: 0.8rem;
`;

const CollapseButton = styled(IconButton)`
  border-radius: 8px;
`;

const Sidebar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const { term, termName, year } = useContext(AppContext);
  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };
  
  const NavBarComponent = collapsed ? StyledNavBarCollapsed : StyledNavBar;

  return (
    <NavBarComponent>
      <HeaderContainer>
        <a href="/">
          <LogoImg
            src={currLogo}
            alt="Notangles logo"
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
        </a>
        <NavbarTitle variant="h6">
          {' '}
          {collapsed ? (
            ''
          ) : (
            <>
              Notangles
              <Weak>{termName.concat(', ', year)}</Weak>
            </>
          )}
        </NavbarTitle>
        {!collapsed && (
          <CollapseButton>
            <BarsArrowUpIcon
              width={28}
              height={28}
              color="#323E4D"
              style={{ transform: 'rotate(270deg)' }}
              onClick={() => handleCollapse(true)}
            ></BarsArrowUpIcon>
          </CollapseButton>
        )}
      </HeaderContainer>
      <SideBarContainer>
        <NavComponentsContainer>
          <CustomModal
            title="About"
            showIcon={<Info />}
            description={'Notangles: no more timetable tangles'}
            content={<About />}
            collapsed={collapsed}
          />
          <CustomModal
            title="Privacy"
            showIcon={<Security />}
            description={'Application Privacy Statement'}
            content={<Privacy />}
            collapsed={collapsed}
          />
          <CustomModal
            title="Changelog"
            showIcon={<Description />}
            description={'Changelog'}
            content={<Changelog />}
            collapsed={collapsed}
          />
          <CustomModal
            title="Settings"
            showIcon={<SettingsIcon />}
            description={'Settings'}
            content={<Settings />}
            collapsed={collapsed}
          />
        </NavComponentsContainer>
        {collapsed && (
          <CollapseButton>
            <BarsArrowUpIcon
              width={28}
              height={28}
              color="#323E4D"
              style={{ transform: 'rotate(90deg)' }}
              onClick={() => handleCollapse(false)}
            ></BarsArrowUpIcon>
          </CollapseButton>
        )}
        {!collapsed && (
          <NavBarFooter>
            <FooterInfo />
            <span>© DevSoc {new Date().getFullYear()}, v1.0.0</span>
          </NavBarFooter>
        )}
      </SideBarContainer>
    </NavBarComponent>
  );
};

export default Sidebar;