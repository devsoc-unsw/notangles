import { CalendarMonth, Description, Info, Security, Settings as SettingsIcon } from '@mui/icons-material';
import { Button, Divider, Drawer, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext, useMemo, useState } from 'react';

import notanglesLogoGif from '../../assets/notangles.gif';
import notanglesLogo from '../../assets/notangles_1.png';
import { leftContentPadding } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import About from './About';
import Changelog from './Changelog';
import CollapseButton from './CollapseButton';
import CustomModal from './CustomModal';
import DarkModeButton from './DarkModeButton';
import FriendsList from './friends/FriendsList';
import FriendsButton from './FriendsButton';
import MobileMenuButton from './MobileMenuButton';
import Privacy from './Privacy';
import Settings from './Settings';
import UserAccount from './UserAccount';

const LogoImg = styled('img')`
  height: 46px;
  margin-right: 12.5px;
  margin-top: -2px;
  margin-left: -5px;
  display: flex;
`;

const drawerWidth = 230;

interface StyledDrawerProps {
  collapsed: boolean;
  isMobile: boolean;
  collapsedWidth: number;
}

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'isMobile' && prop !== 'collapsedWidth',
})<StyledDrawerProps>(({ collapsed, isMobile, collapsedWidth }) => ({
  position: isMobile ? 'fixed' : 'relative',
  flexShrink: 0,
  width: collapsed ? collapsedWidth : drawerWidth,
  transition: 'width 0.1s ease',
  zIndex: 1200,
  marginRight: leftContentPadding,
  height: '100vh',

  '& .MuiDrawer-paper': {
    top: 0,
    alignSelf: 'flex-start',
    height: '100dvh',
    width: collapsed ? collapsedWidth : drawerWidth,
    transition: 'width 0.1s ease',
    overflowX: 'hidden',
  },
}));

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const HeaderAndControlsContainer = styled('div')`
  flex: 1;
  overflow-y: auto;
`;

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

const NavComponentsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 20px 16px;
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
`;

const SidebarFooterWrapper = styled('div')`
  display: flex;
  flex-direction: row;
`;

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

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsedWidth = useMemo(() => (isMobile ? 0 : 80), [isMobile]);

  const [currLogo, setCurrLogo] = useState(notanglesLogo);
  const [friendsListOpen, setFriendsListOpen] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(AppContext);

  const handleCollapse = (val: boolean) => {
    setSidebarCollapsed(val);
    // forces window resize event upon sidebar state changing to adjust position of cards
    // Not currently used, but here is how you would do it if needed
    // setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
  };

  const modalComponents = useMemo(
    () =>
      modalData.map((modal, index) => (
        <CustomModal
          key={index}
          title={modal.title}
          toolTipTitle={modal.toolTipTitle}
          showIcon={modal.showIcon}
          description={modal.description}
          content={modal.content}
          isClickable={modal.isClickable}
        />
      )),
    [],
  );

  return (
    <>
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        collapsedWidth={collapsedWidth}
        open={!sidebarCollapsed}
        onClose={() => {
          handleCollapse(true);
        }}
        elevation={0}
      >
        <Container>
          <HeaderAndControlsContainer>
            <HeaderContainer>
              <a href="/">
                <LogoImg
                  src={currLogo}
                  alt="Notangles logo"
                  onMouseOver={() => {
                    setCurrLogo(notanglesLogoGif);
                  }}
                  onMouseOut={() => {
                    setCurrLogo(notanglesLogo);
                  }}
                />
              </a>
              {!sidebarCollapsed && (
                <>
                  <SidebarTitle variant="h6">Notangles</SidebarTitle>
                </>
              )}
            </HeaderContainer>

            <Divider />

            <NavComponentsContainer>
              <CustomModal
                title="Timetable"
                toolTipTitle="Timetable"
                showIcon={<CalendarMonth />}
                description={'Current Timetable'}
                content={null}
                // currently not clickable since this is our current page
                isClickable={false}
                // hardcoded until we move away from single page site
                isSelected={true}
              />
              <FriendsButton
                friendsListOpen={friendsListOpen}
                handleFriendsListToggle={() => {
                  setFriendsListOpen((prev) => !prev);
                }}
              />
              {!friendsListOpen ? (
                <>
                  <Divider />
                  {modalComponents}
                </>
              ) : (
                <FriendsList />
              )}
            </NavComponentsContainer>
          </HeaderAndControlsContainer>

          <SidebarFooter>
            {friendsListOpen && (
              <Button variant="outlined" disableElevation>
                Add Friend
              </Button>
            )}
            <DarkModeButton />
            <UserAccount />
            {!isMobile && !sidebarCollapsed ? (
              <SidebarFooterText>
                <Divider />
                <SidebarFooterWrapper>
                  <div>
                    © DevSoc {new Date().getFullYear()}, v1.0.0,{' '}
                    {import.meta.env.VITE_COMMIT?.substring(0, 7) ?? 'unknown commit'}
                  </div>
                  <CollapseButton
                    onClick={() => {
                      handleCollapse(true);
                    }}
                    toolTipTitle="Collapse"
                  />
                </SidebarFooterWrapper>
              </SidebarFooterText>
            ) : (
              !isMobile && (
                <CollapseButton
                  onClick={() => {
                    handleCollapse(false);
                  }}
                  toolTipTitle="Expand"
                />
              )
            )}
          </SidebarFooter>
        </Container>
      </StyledDrawer>
      {isMobile && (
        <MobileMenuButton
          onClick={() => {
            handleCollapse(false);
          }}
          toolTipTitle={sidebarCollapsed ? 'Expand' : 'Collapse'}
        />
      )}
    </>
  );
};

export default Sidebar;
