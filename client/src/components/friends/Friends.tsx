import { Box, Button, GlobalStyles, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { styled } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { contentPadding, darkTheme, leftContentPadding, lightTheme } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import Sidebar from '../sidebar/Sidebar';
import Sponsors from '../Sponsors';
import Footer from '../footer/Footer';
import Alerts from '../Alerts';
import ActivityBar from './ActivityBar';
import { TimetableTabs } from '../timetableTabs/TimetableTabs';
import Timetable from '../timetable/Timetable';
import Controls from '../controls/Controls';
import { CourseContext } from '../../context/CourseContext';
import FriendsTimetable from './FriendsTimetable';

const StyledApp = styled(Box)`
  height: 100%;
  width: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: ${contentPadding}px;
  padding-left: ${leftContentPadding}px;
//   padding-right: ${contentPadding}px;
  transition:
    background 0.2s,
    color 0.2s;
  min-height: 50vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Content = styled(Box)`
  width: 1400px;
  max-width: 100%;
  transition: width 0.2s;
  display: grid;
  grid-template-rows: min-content min-content auto;
  grid-template-columns: auto;
  text-align: center;
`;

const Friends: React.FC = () => {
  const { isDarkMode } = useContext(AppContext);
  const {
    selectedCourses,
    setSelectedCourses,
    selectedClasses,
    setSelectedClasses,
    createdEvents,
    setCreatedEvents,
    assignedColors,
    setAssignedColors,
  } = useContext(CourseContext);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
          {/* <GlobalStyles styles={globalStyle} /> */}
          <StyledApp>
            <Sidebar />
            <ContentWrapper>
              <Content>
                <FriendsTimetable />
                <Sponsors />
                <Footer />
                <Alerts />
              </Content>
            </ContentWrapper>
          </StyledApp>
        {/* </LocalizationProvider> */}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default Friends;
