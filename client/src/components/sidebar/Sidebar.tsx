import { CalendarMonth, Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, AppBarProps, Divider, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useEffect, useRef, useState } from 'react';

import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { UserContext } from '../../context/UserContext';
import About from './About';
import Changelog from './Changelog';
import CollapseButton from './CollapseButton';
import CustomModal from './CustomModal';
import DarkModeButton from './DarkModeButton';
import FriendsButton from './FriendsButton';
import GroupsSidebar from './groupsSidebar/GroupsSidebar';
import Privacy from './Privacy';
import Settings from './Settings';
import TermSelect from './TermSelect';
import UserAccount from './UserAccount';

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

const StyledSidebar = styled(AppBar)<StyledSidebarProps>(({ collapsed }) => ({
  width: 'fit-content',
  left: 0,
  transition: 'width 0.2s ease',
  zIndex: 1201,
  display: 'flex',
  flexDirection: 'row',

  // overriding MUI select component padding when focused (for the term select)
  paddingRight: '0 !important',
  padding: '10px, 0px, 10px, 19px',
}));

const MainSidebar = styled('div')<StyledSidebarProps>(({ theme, collapsed }) => ({
  backgroundColor: theme.palette.background.paper,
  height: '100vh',
  color: theme.palette.text.primary,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: collapsed ? '80px' : '290px',
  overflowY: 'auto',
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
  padding: 10px 16px 20px 16px;
  gap: 8px;
`;

const SidebarFooterText = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 0.8rem;
  margin-top: 16px;
`;

const StyledGroupContainer = styled('div')`
  height: 100vh;
  width: 60px;
  background: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  padding: 12px 2px;
  flex-direction: column;
  gap: 4px;

  overflow-y: auto;
  max-height: calc(100vh - 24px);

  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, and Edge */
  }
`;

const Sidebar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const [collapsed, setCollapsed] = useState(true);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const { groupsSidebarCollapsed } = useContext(UserContext);

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
      {!groupsSidebarCollapsed && (
        <StyledGroupContainer>
          <GroupsSidebar />
        </StyledGroupContainer>
      )}
      <MainSidebar collapsed={collapsed}>
        <div>
          <HeaderContainer>
            <a href="/">
              <LogoImg
                src={currLogo}
                alt="Notangles logo"
                onMouseOver={() => setCurrLogo(notanglesLogoGif)}
                onMouseOut={() => setCurrLogo(notanglesLogo)}
              />
            </a>
            {!collapsed && (
              <>
                <SidebarTitle variant="h6">Notangles</SidebarTitle>
                <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(true)} toolTipTitle="Collapse" />
              </>
            )}
          </HeaderContainer>

          <Divider />

          <SideBarContainer>
            <TermSelect collapsed={collapsed} handleExpand={() => handleCollapse(false)} />

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
              <FriendsButton collapsed={collapsed} />
              <Divider />
              {modalData.map((modal, index) => (
                <React.Fragment key={index}>
                  <CustomModal
                    title={modal.title}
                    toolTipTitle={modal.toolTipTitle}
                    showIcon={modal.showIcon}
                    description={modal.description}
                    content={modal.content}
                    collapsed={collapsed}
                    isClickable={modal.isClickable}
                  />
                </React.Fragment>
              ))}
            </NavComponentsContainer>
          </SideBarContainer>
        </div>

        <SidebarFooter>
          <DarkModeButton collapsed={collapsed} />
          <UserAccount collapsed={collapsed} />
          {!collapsed ? (
            <SidebarFooterText>
              <Divider />
              <span>© DevSoc {new Date().getFullYear()}, v1.0.0</span>
            </SidebarFooterText>
          ) : (
            <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(false)} toolTipTitle="Expand" />
          )}
        </SidebarFooter>
      </MainSidebar>
    </StyledSidebar>
  );
};

export default Sidebar;
