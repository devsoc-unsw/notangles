import React, { useEffect, FunctionComponent, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { MuiThemeProvider, Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {
  CourseData, ClassData, ClassTime, ClassPeriod, filterOutClasses,
} from '@notangles/common';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import Autotimetabler from './components/Autotimetabler';
import CourseSelect from './components/CourseSelect';
import FriendsDrawer from './components/Friends';

import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';

import storage from './utils/storage';

import { darkTheme, lightTheme } from './constants/theme';
import NetworkError from './interfaces/NetworkError';

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: 64px; // for nav bar
  padding-left: 30px;
  padding-right: 30px;
  transition: background-color 0.2s, color 0.2s;
  min-height: 100vh;
  box-sizing: border-box;

  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;

  background-color: ${(props) => props.theme.palette.background.default};
  color: ${(props) => props.theme.palette.text.primary};
`;

interface StyledContentProps {
  drawerOpen: boolean;
}

// width: ${() => (drawerOpen ? 'calc(100% - 240px)' : '100%')};
const Content = styled(Box)<StyledContentProps>`
  width: ${(props) => (props.drawerOpen ? 'calc(100% - 240px)' : '100%')};
  transition: width 0.2s;

  display: grid;
  grid-template-rows: min-content min-content auto;
  grid-template-columns: auto;

  text-align: center;
`;

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
`;

const Footer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin: 40px;
`;

const App: FunctionComponent = () => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<ClassData[]>([]);
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [errorMsg, setErrorMsg] = useState<String>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [isFriendsListOpen, setIsFriendsListOpen] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const assignedColors = useColorMapper(
    selectedCourses.map((course) => course.code),
  );

  useEffect(() => {
    storage.set('is12HourMode', is12HourMode);
  }, [is12HourMode]);

  useEffect(() => {
    storage.set('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  const handleSelectClass = (classData: ClassData) => {
    setSelectedClasses((prev) => (
      [...filterOutClasses(prev, classData), classData]
    ));
  };

  const handleRemoveClass = (classData: ClassData) => {
    setSelectedClasses((prev) => (
      filterOutClasses(prev, classData)
    ));
  };

  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) => (
    (period1.day === period2.day && period1.start >= period2.start
        && period1.start < period2.end)
     || (period1.day === period2.day && period2.start >= period1.start
        && period2.start < period1.end)
  );

  const checkClashes = () => {
    const newClashes: Array<ClassPeriod> = [];
    selectedClasses.forEach((classActivity1) => {
      classActivity1.periods.forEach((period1) => {
        selectedClasses.forEach((classActivity2) => {
          classActivity2.periods.forEach((period2) => {
            if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
              if (!newClashes.includes(period1)) {
                console.log(classActivity1);
                newClashes.push(period1);
              }
              if (!newClashes.includes(period2)) {
                newClashes.push(period2);
              }
            }
          });
        });
      });
    });
    return newClashes;
  };

  // TODO: temp until auto-timetabling is done
  // currently just selects first available classes
  const populateTimetable = (newCourse: CourseData) => {
    Object.values(newCourse.activities).forEach((classes) => {
      handleSelectClass(classes[0]);
    });
  };

  const handleSelectCourse = async (courseCode: string) => {
    try {
      const selectedCourseClasses = await getCourseInfo('2020', 'T3', courseCode);
      const newSelectedCourses = [...selectedCourses, selectedCourseClasses];
      populateTimetable(selectedCourseClasses); // TODO: temp until auto-timetabling is done
      setSelectedCourses(newSelectedCourses);
    } catch (e) {
      if (e instanceof NetworkError) {
        setErrorMsg(e.message);
        setErrorVisibility(true);
      }
    }
  };

  const handleDrawerOpen = () => {
    setIsFriendsListOpen(!isFriendsListOpen);
  };

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter(
      (course) => course.code !== courseCode,
    );
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => (
      prev.filter((classData) => classData.course.code !== courseCode)
    ));
  };

  const handleErrorClose = () => {
    setErrorVisibility(false);
  };

  const handleSetIsLoggedIn = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <StyledApp>
          <Navbar
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
            handleDrawerOpen={handleDrawerOpen}
          />
          <FriendsDrawer
            isFriendsListOpen={isFriendsListOpen}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={handleSetIsLoggedIn}
          />
          <ContentWrapper>
            <Content drawerOpen={isFriendsListOpen}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <SelectWrapper>
                    <CourseSelect
                      selectedCourses={selectedCourses}
                      assignedColors={assignedColors}
                      handleSelect={handleSelectCourse}
                      handleRemove={handleRemoveCourse}
                      setErrorMsg={setErrorMsg}
                      setErrorVisibility={setErrorVisibility}
                    />
                  </SelectWrapper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autotimetabler isDarkMode={isDarkMode} />
                </Grid>
              </Grid>
              <DndProvider backend={HTML5Backend}>
                <Timetable
                  selectedCourses={selectedCourses}
                  selectedClasses={selectedClasses}
                  assignedColors={assignedColors}
                  is12HourMode={is12HourMode}
                  setIs12HourMode={setIs12HourMode}
                  onSelectClass={handleSelectClass}
                  onRemoveClass={handleRemoveClass}
                  clashes={checkClashes()}
                />
              </DndProvider>
              <Footer>
                DISCLAIMER: While we try our best, Notangles is not an
                official UNSW site, and cannot guarantee data accuracy or
                reliability.
                <br />
                <br />
                Made by &gt;_ CSESoc UNSW&nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="mailto:projects@csesoc.org.au">
                  Email
                </Link>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="https://github.com/csesoc/notangles">
                  GitHub
                </Link>
              </Footer>
              <Snackbar open={errorVisibility} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert severity="error" onClose={handleErrorClose} variant="filled">
                  {errorMsg}
                </Alert>
              </Snackbar>
            </Content>
          </ContentWrapper>
        </StyledApp>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
export default App;
