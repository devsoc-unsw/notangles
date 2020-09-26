import React, { useEffect, FunctionComponent, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { MuiThemeProvider, Box } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { useDrag } from './utils/Drag';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import CourseSelect from './components/CourseSelect';
import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';
import storage from './utils/storage';
import { darkTheme, lightTheme } from './constants/theme';
import {
  CourseData,
  ClassData,
  SelectedClasses,
} from './interfaces/CourseData';

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

  background-color: ${({ theme }) => theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Content = styled(Box)`
  width: 1400px;
  min-width: 1100px;
  max-width: 100%;
  margin: auto;

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
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));

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
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.course.code][classData.activity] = classData;
      return prev;
    });
  };

  const handleRemoveClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.course.code][classData.activity] = null;
      return prev;
    });
  };
  
  useDrag(handleSelectClass, handleRemoveClass);

  const initCourse = (course: CourseData) => {
    setSelectedClasses((prev) => {
      prev[course.code] = {};

      Object.keys(course.activities).forEach((activity) => {
        prev[course.code][activity] = course.activities[activity][0]; // temp
      });
      
      return prev;
    });
  };

  const handleSelectCourse = async (courseCode: string) => {
    const newCourse = await getCourseInfo('2020', 'T1', courseCode);
    if (newCourse) {
      const newSelectedCourses = [...selectedCourses, newCourse];
      setSelectedCourses(newSelectedCourses);
      initCourse(newCourse);
    }
  };

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter(
      (course) => course.code !== courseCode,
    );
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => {
      delete prev[courseCode];
      return prev;
    });
  };

  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <StyledApp>
          <Navbar
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
          />
          <ContentWrapper>
            <Content>
              <SelectWrapper>
                <CourseSelect
                  selectedCourses={selectedCourses}
                  assignedColors={assignedColors}
                  handleSelect={handleSelectCourse}
                  handleRemove={handleRemoveCourse}
                />
              </SelectWrapper>
              {/* <DragManager
                // selectedClasses={selectedClasses}
                selectClass={handleSelectClass}
              > */}
                <Timetable
                  selectedCourses={selectedCourses}
                  selectedClasses={selectedClasses}
                  assignedColors={assignedColors}
                  is12HourMode={is12HourMode}
                  setIs12HourMode={setIs12HourMode}
                />
              {/* </DragManager> */}
              <Footer>
                DISCLAIMER: While we try our best, Notangles is not an
                official UNSW site, and cannot guarantee data accuracy or
                reliability.
                <br />
                <br />
                Made by &gt;_ CSESoc UNSW&nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="mailto:projects@csesoc.org.au">
                  Feedback
                </Link>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="https://github.com/csesoc/notangles">
                  GitHub
                </Link>
              </Footer>
            </Content>
          </ContentWrapper>
        </StyledApp>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

export default App;
