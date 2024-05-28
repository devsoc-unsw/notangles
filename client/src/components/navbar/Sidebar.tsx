import { Description, Info, Security, Settings as SettingsIcon, Group, CalendarMonth } from '@mui/icons-material';
import { AppBar, IconButton, Typography, AppBarProps, Divider } from '@mui/material';
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
import TermSelect from './TermSelect';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -5.5px;
`;

interface StyledNavBarProps extends AppBarProps {
  collapsed: boolean;
}

const StyledNavBar = styled(AppBar)<StyledNavBarProps>(({ theme, collapsed }) => ({
  backgroundColor: theme.palette.background.paper,
  width: collapsed ? '80px' : '290px',
  height: '100vh',
  left: 0,
  color: theme.palette.text.primary,
  transition: 'width 0.2s ease',
  zIndex: 1201,
  // overriding MUI select component padding when focused (for the term select)
  paddingRight: '0 !important',
}));

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
  padding: 20px 16px 20px 16px;
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
  gap: 12px;
  font-size: 0.8rem;
  padding: 10px 19px 20px 19px;
`;

const CollapseButton = styled(IconButton)`
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.primary.main};
`;

const Sidebar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setCollapsed(true);
      }
    };
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <StyledNavBar ref={ref} collapsed={collapsed} onClick={() => setCollapsed(false)}>
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
              style={{ transform: 'rotate(270deg)' }}
              onClick={() => handleCollapse(true)}
            ></BarsArrowUpIcon>
          </CollapseButton>
        )}
      </HeaderContainer>
      <SideBarContainer>
        <TermSelect collapsed={collapsed} />
        {!collapsed && <br />}
        <NavComponentsContainer>
          <CustomModal
            title="Timetable"
            toolTipTitle="Timetable"
            showIcon={<CalendarMonth />}
            description={'Current Timetable'}
            content={null}
            collapsed={collapsed}
            // currently not clickable since this is our current page
            isClickable={false}
          />
          <CustomModal
            title="About"
            toolTipTitle="About"
            showIcon={<Info />}
            description={'Notangles: no more timetable tangles'}
            content={<About />}
            collapsed={collapsed}
            isClickable={true}
          />
          <CustomModal
            title="Privacy"
            toolTipTitle="Privacy"
            showIcon={<Security />}
            description={'Application Privacy Statement'}
            content={<Privacy />}
            collapsed={collapsed}
            isClickable={true}
          />
          <CustomModal
            title="Changelog"
            toolTipTitle="Changelog"
            showIcon={<Description />}
            description={'Changelog'}
            content={<Changelog />}
            collapsed={collapsed}
            isClickable={true}
          />
        </NavComponentsContainer>
        <CustomModal
          title="Settings"
          toolTipTitle="Settings"
          showIcon={<SettingsIcon />}
          description={'Settings'}
          content={<Settings />}
          collapsed={collapsed}
          isClickable={true}
        />
        <CustomModal
          title="Friends"
          toolTipTitle="Coming Soon: Friends"
          showIcon={<Group />}
          description={'View Friends Timetables'}
          content={null}
          collapsed={collapsed}
          isClickable={false}
        />
        {collapsed && (
          <CollapseButton>
            <BarsArrowUpIcon
              width={28}
              height={28}
              style={{ transform: 'rotate(90deg)' }}
              onClick={() => handleCollapse(false)}
            ></BarsArrowUpIcon>
          </CollapseButton>
        )}
      </SideBarContainer>
      {!collapsed && (
        <NavBarFooter>
          <Divider />
          {/* <FooterInfo /> */}
          <span>© DevSoc {new Date().getFullYear()}, v1.0.0</span>
        </NavBarFooter>
      )}
    </StyledNavBar>
  );
};

export default Sidebar;
