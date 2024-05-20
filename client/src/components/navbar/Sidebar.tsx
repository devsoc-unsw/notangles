import { Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState, useRef, useEffect } from 'react';
import { BarsArrowUpIcon } from '@heroicons/react/24/outline';
import FooterInfo from '../footer/FooterInfo';
import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import About from './About';
import Changelog from './Changelog';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -5.5px;
`;

const StyledNavBar = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  width: 290px;
  height: 100vh;
  left: 0;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledNavBarCollapsed = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  width: 80px;
  height: 100vh;
  left: 0;
  color: ${({ theme }) => theme.palette.text.primary};
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
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };

  const NavBarComponent = collapsed ? StyledNavBarCollapsed : StyledNavBar;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setCollapsed(true);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <NavBarComponent ref={ref}>
      <HeaderContainer>
        <a href="/">
          <LogoImg
            src={currLogo}
            alt="Notangles logo"
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
        </a>
        <NavbarTitle variant="h6"> {collapsed ? '' : <>Notangles</>}</NavbarTitle>
        {!collapsed && (
          <CollapseButton>
            <BarsArrowUpIcon
              width={28}
              height={28}
              color="inherit"
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
              color="inherit"
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
