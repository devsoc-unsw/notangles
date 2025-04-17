import { CalendarMonth, Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, AppBarProps, Drawer, Divider, Typography, Toolbar } from '@mui/material';

import { Box, styled } from '@mui/system';
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


const drawerWidth = 250;
const collapsedWidth = 80;

interface StyledDrawerProps {
  collapsed: boolean;
}

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<StyledDrawerProps>(({ collapsed }) => ({
  position: 'relative',
  flexShrink: 0,
  width: collapsed ? collapsedWidth : drawerWidth,
  height: '100vh',
  transition: 'width 0.1s ease',
  
  // styling for the panel inside the drawer
  '& .MuiDrawer-paper': {
    position: 'relative',
    width: collapsed ? collapsedWidth : drawerWidth,
    transition: 'width 0.1s ease',
    overflowX: 'hidden',
  },
}));

const SidebarTitle = styled(Typography)`
  font-weight: 700;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-left: 5px;
  align-text: center;
`;

const HeaderContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 19px 10px 19px;
`;

const SideBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 20px 16px;
  gap: 16px;
`;

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
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

const SidebarFooterWrapper = styled('div')`
  display: flex;
  flex-direction: row;
`

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

const NewSidebar: React.FC = () => {
  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const [collapsed, setCollapsed] = useState(false);
  const { groupsSidebarCollapsed } = useContext(UserContext);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };

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
    <Box sx={{ display: 'flex' }}>
      <StyledDrawer variant='permanent' collapsed={collapsed}>
      {/* {!groupsSidebarCollapsed && (
        <StyledGroupContainer>
          <GroupsSidebar />
        </StyledGroupContainer>
      )} */}
        <Container>
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

          <SidebarFooter>
            <DarkModeButton collapsed={collapsed} />
            <UserAccount collapsed={collapsed} />
            {!collapsed ? (
              <>
                <SidebarFooterText>
                <Divider />
                  <SidebarFooterWrapper>
                    <div>
                      © DevSoc {new Date().getFullYear()}, v1.0.0,{' '}
                      {import.meta.env.VITE_COMMIT?.substring(0, 7) ?? 'unknown commit'}
                    </div>
                    <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(true)} toolTipTitle="Collapse" />
                  </SidebarFooterWrapper>
                </SidebarFooterText>
              </>
            ) : (
              <CollapseButton collapsed={collapsed} onClick={() => handleCollapse(false)} toolTipTitle="Expand" />
            )}
          </SidebarFooter>
        </Container>
      </StyledDrawer>
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <p style={{ fontSize: '30px', color: 'white', fontWeight: 500 }}>
        no more tangles.
      </p>
      </Box>
    </Box>
  );
};

export default NewSidebar;
