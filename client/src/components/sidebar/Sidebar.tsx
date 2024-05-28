import { Description, Info, Security, Settings as SettingsIcon, Group, CalendarMonth } from '@mui/icons-material';
import { AppBar, IconButton, Typography, AppBarProps, Divider } from '@mui/material';
import { color, styled } from '@mui/system';
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

interface StyledSidebarProps extends AppBarProps {
  collapsed: boolean;
}

const StyledSidebar = styled(AppBar)<StyledSidebarProps>(({ theme, collapsed }) => ({
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

const SidebarFooter = styled('div')`
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
  const sideBarRef = useRef<HTMLDivElement>(null);
  const sideBarCloseRef = useRef<HTMLDivElement>(null);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
  };

  // const handleClickOpen = (event: any) => {
  //   if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
  //     setCollapsed(true);
  //   }
  // };
  // TODO: remove the above?? or work with it to handle opening the sidebar by clicking on it -> but problem when trying to close with button

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
      showIcon: <Info sx={{ color: (theme) => theme.palette.primary.main }} />,
      description: 'Notangles: no more timetable tangles',
      content: <About />,
      isClickable: true,
    },
    {
      title: 'Privacy',
      toolTipTitle: 'Privacy',
      showIcon: <Security sx={{ color: (theme) => theme.palette.primary.main }} />,
      description: 'Application Privacy Statement',
      content: <Privacy />,
      isClickable: true,
    },
    {
      title: 'Changelog',
      toolTipTitle: 'Changelog',
      showIcon: <Description sx={{ color: (theme) => theme.palette.primary.main }} />,
      description: 'Changelog',
      content: <Changelog />,
      isClickable: true,
    },
    {
      title: 'Settings',
      toolTipTitle: 'Settings',
      showIcon: <SettingsIcon sx={{ color: (theme) => theme.palette.primary.main }} />,
      description: 'Settings',
      content: <Settings />,
      isClickable: true,
    },
  ];

  return (
    // <StyledSidebar ref={sideBarRef} collapsed={collapsed} onClick={handleClickOpen}>
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
            showIcon={<CalendarMonth sx={{ color: (theme) => theme.palette.primary.main }} />}
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
            showIcon={<Group sx={{ color: (theme) => theme.palette.primary.main }} />}
            description={'View Friends Timetables'}
            content={null}
            collapsed={collapsed}
            isClickable={false}
          />
          {!collapsed && <br />}
          <Divider />
          {!collapsed && <br />}
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
        <SidebarFooter>
          <Divider />
          {/* <FooterInfo /> */}
          <span>© DevSoc {new Date().getFullYear()}, v1.0.0</span>
        </SidebarFooter>
      )}
    </StyledSidebar>
  );
};

export default Sidebar;
