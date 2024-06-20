import { CalendarMonth,Description, Group, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, AppBarProps, Divider,Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useEffect,useRef, useState } from 'react';

import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import About from './About';
import Changelog from './Changelog';
import CollapseButton from './CollapseButton';
import CustomModal from './CustomModal';
import Privacy from './Privacy';
import Settings from './Settings';
import TermSelect from './TermSelect';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -5px;
  display: flex;
`;

interface StyledSidebarProps extends AppBarProps {
  collapsed: boolean;
}

const StyledSidebar = styled(AppBar)<StyledSidebarProps>(({ theme, collapsed }) => ({
  backgroundColor: theme.palette.background.paper,
  width: collapsed ? '80px' : '290px',
  height: '100vh',
  left: 62,
  color: theme.palette.text.primary,
  transition: 'width 0.2s ease',
  zIndex: 1201,
  // overriding MUI select component padding when focused (for the term select)
  paddingRight: '0 !important',
}));

const SidebarTitle = styled(Typography)`
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
`;

const SideBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 20px 16px;
  height: 100%;
  gap: 16px;
`;

const NavComponentsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
`;

const SidebarFooter = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 12px;
  font-size: 0.8rem;
  padding: 10px 19px 20px 19px;
`;

const Sidebar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const [collapsed, setCollapsed] = useState(true);
  const sideBarRef = useRef<HTMLDivElement>(null);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
        setCollapsed(true);
      }
    };
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sideBarRef]);

  const modalData = [
    {
      title: 'About',
      toolTipTitle: 'About',
      showIcon: <Info />,
      description: 'Notangles: no more timetable tangles',
      content: <About />,
      isClickable: true,
    },
    {
      title: 'Privacy',
      toolTipTitle: 'Privacy',
      showIcon: <Security />,
      description: 'Application Privacy Statement',
      content: <Privacy />,
      isClickable: true,
    },
    {
      title: 'Changelog',
      toolTipTitle: 'Changelog',
      showIcon: <Description />,
      description: 'Changelog',
      content: <Changelog />,
      isClickable: true,
    },
    {
      title: 'Settings',
      toolTipTitle: 'Settings',
      showIcon: <SettingsIcon />,
      description: 'Settings',
      content: <Settings />,
      isClickable: true,
    },
  ];

  return (
    <StyledSidebar ref={sideBarRef} collapsed={collapsed}>
      <HeaderContainer>
        <a href="/">
          <LogoImg
            src={currLogo}
            alt="Notangles logo"
            onMouseOver={() => setCurrLogo(notanglesLogoGif)}
            onMouseOut={() => setCurrLogo(notanglesLogo)}
          />
        </a>
        {!collapsed && <SidebarTitle variant="h6">Notangles</SidebarTitle>}
        {!collapsed && (
          <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(true)} toolTipTitle="Collapse" />
        )}
      </HeaderContainer>
      <Divider />
      <SideBarContainer>
        <TermSelect collapsed={collapsed} />
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
            // hardcoded until we move away from single page site
            isSelected={true}
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
          <Divider />
          {modalData.map((modal, index) => (
            <>
              <CustomModal
                key={index}
                title={modal.title}
                toolTipTitle={modal.toolTipTitle}
                showIcon={modal.showIcon}
                description={modal.description}
                content={modal.content}
                collapsed={collapsed}
                isClickable={modal.isClickable}
              />
            </>
          ))}
        </NavComponentsContainer>
        {collapsed && (
          <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(false)} toolTipTitle="Expand" />
        )}
      </SideBarContainer>
      {!collapsed && (
        <SidebarFooter>
          <Divider />
          <span>© DevSoc {new Date().getFullYear()}, v1.0.0</span>
        </SidebarFooter>
      )}
    </StyledSidebar>
  );
};

export default Sidebar;
