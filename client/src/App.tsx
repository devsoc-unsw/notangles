import React, { useEffect, FunctionComponent, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { MuiThemeProvider, Box } from '@material-ui/core';
import Link from '@material-ui/core/Link';
// import Alert from '@material-ui/lab/Alert';
// import Snackbar from '@material-ui/core/Snackbar';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import CourseSelect from './components/CourseSelect';
import {
  CourseData, ClassData, ClassTime, filterOutClasses,
} from './interfaces/CourseData';
import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';

import storage from './utils/storage';

import { darkTheme, lightTheme } from './constants/theme';

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

  background-color: ${(props) => props.theme.palette.background.default};
  color: ${(props) => props.theme.palette.text.primary};
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
  const [selectedClasses, setSelectedClasses] = useState<ClassData[]>([]);
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));

  // const [clashes, setClashes] = useState<Set<ClassData[]>>(new Set());

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

  // TODO: temp until auto-timetabling is done
  // currently just selects first available classes
  const populateTimetable = (newCourse: CourseData) => {
    Object.values(newCourse.activities).forEach((classes) => {
      handleSelectClass(classes[0]);
    });
  };

  const handleSelectCourse = async (courseCode: string) => {
    const selectedCourseClasses = await getCourseInfo('2020', 'T2', courseCode);
    if (selectedCourseClasses) {
      const newSelectedCourses = [...selectedCourses, selectedCourseClasses];
      populateTimetable(selectedCourseClasses); // TODO: temp until auto-timetabling is done
      setSelectedCourses(newSelectedCourses);
    }
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

  // make into state to send to card component
  // let hasClash = false;
  // const clashes: Array<[string, string]> = [];

  function hasTimeOverlap(period1: ClassTime, period2: ClassTime): boolean {
    return ((period1.day === period2.day && period1.start >= period2.start
        && period1.start < period2.end)
     || (period1.day === period2.day && period2.start >= period1.start
        && period2.start < period1.end));
  }

  function checkClashes():Array<String> {
    // for class in selectedclasses
    //   for period in class
    //       for class in selectedClasses
    //           for period in class
    //               if hasoverlap add to clashes
    const newClashes: Array<String> = [];
    selectedClasses.forEach((classActivity1) => {
      classActivity1.periods.forEach((period1) => {
        selectedClasses.forEach((classActivity2) => {
          classActivity2.periods.forEach((period2) => {
            if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
              if (!newClashes.includes(classActivity1.id)) {
                newClashes.push(classActivity1.id);
              }
              if (!newClashes.includes(classActivity2.id)) {
                newClashes.push(classActivity2.id);
              }
            }
          });
        });
      });
    });
    console.log('all classes with clashes:', newClashes);
    return newClashes;
  }
  // checkClashes();

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
