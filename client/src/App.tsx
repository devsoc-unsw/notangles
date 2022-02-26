import React, { useEffect, useState } from 'react';
import { MuiThemeProvider, Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import {
  CourseData,
  ClassData,
  SelectedClasses,
  ClassTime,
  ClassPeriod,
  CourseCode,
  Activity,
  InInventory,
} from './interfaces/Course';
import { useDrag } from './utils/Drag';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import Autotimetabler from './components/Autotimetabler';
import CourseSelect from './components/CourseSelect';
import FriendsDrawer, { drawerWidth } from './components/friends/Friends';
import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import storage from './utils/storage';
import { darkTheme, lightTheme, ThemeType, contentPadding } from './constants/theme';
import { year, term, isPreview } from './constants/timetable';
import NetworkError from './interfaces/NetworkError';

const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  body {
    background: ${(props) => props.theme.palette.background.default};
    transition: background 0.2s;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.palette.background.default};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.secondary.main};
    border-radius: 5px;
    opacity: 0.5;
    transition: background 0.2s;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: 64px; // for nav bar
  padding-left: ${contentPadding}px;
  padding-right: ${contentPadding}px;
  transition: background 0.2s, color 0.2s;
  min-height: 100vh;
  box-sizing: border-box;

  display: flex;
  flex-direction: row-reverse;
  justify-content: ${isPreview ? 'flex-start' : 'center'};

  color: ${(props) => props.theme.palette.text.primary};
`;

interface StyledContentProps {
  drawerOpen: boolean;
}

const getContentWidth = (drawerOpen: boolean) => {
  let contentWidth = '1400px';
  if (isPreview) {
    contentWidth = drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%';
  }
  return contentWidth;
};

const Content = styled(Box)<StyledContentProps>`
  width: ${(props: StyledContentProps) => getContentWidth(props.drawerOpen)};
  max-width: 100%;
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
  margin-bottom: 25px;
`;

const App: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [errorMsg, setErrorMsg] = useState<String>('');
  const [infoMsg] = useState<String>('Press and hold to drag a class');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [isFriendsListOpen, setIsFriendsListOpen] = React.useState(isPreview);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isHideFullClasses, setIsHideFullClasses] = useState<boolean>(storage.get('isHideFullClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [lastUpdated, setLastUpdated] = useState(0);

  if (infoVisibility) {
    if (storage.get('hasShownInfoMessage')) {
      setInfoVisibility(false);
    }

    storage.set('hasShownInfoMessage', true);
  }

  const assignedColors = useColorMapper(selectedCourses.map((course) => course.code));

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

  const handleLastUpdated = (date: number) => {
    setLastUpdated(date);
  };

  useDrag(handleSelectClass, handleRemoveClass);

  const initCourse = (course: CourseData, isDefaultUnscheduled?: boolean) => {
      setSelectedClasses((prevRef) => {
        const prev = { ...prevRef };

        prev[course.code] = {};

        Object.keys(course.activities).forEach((activity) => {
          // temp until auto timetabling works
          [prev[course.code][activity]] = isDefaultUnscheduled ? [null] : course.activities[activity]; // null for unscheduled
        });

        return prev;
      });
  };
  
  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) =>
    period1.day === period2.day &&
    ((period1.end > period2.start && period1.start < period2.end) ||
      (period2.end > period1.start && period2.start < period1.end));

  const checkClashes = () => {
    const newClashes: ClassPeriod[] = [];

    const flatPeriods = Object.values(selectedClasses)
      .flatMap((activities) => Object.values(activities))
      .flatMap((classData) => (classData ? classData.periods : []));

    flatPeriods.forEach((period1) => {
      flatPeriods.forEach((period2) => {
        if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
          if (!newClashes.includes(period1)) {
            newClashes.push(period1);
          }
          if (!newClashes.includes(period2)) {
            newClashes.push(period2);
          }
        }
      });
    });

    return newClashes;
  };

  const handleSelectCourse = async (
    data: string | string[],
    noInit?: boolean,
    callback?: (_selectedCourses: CourseData[]) => void,
    isDefaultUnscheduled?: boolean,
  ) => {
    const codes: string[] = Array.isArray(data) ? data : [data];
    Promise.all(codes.map((code) => getCourseInfo(year, term, code)))
      .then((result) => {
        const addedCourses = result as CourseData[];
        const newSelectedCourses = [...selectedCourses, ...addedCourses];

        setSelectedCourses(newSelectedCourses);

        if (!noInit) addedCourses.forEach((course) => initCourse(course, isDefaultUnscheduled));
        if (callback) callback(newSelectedCourses);
      })
      .catch((e) => {
        if (e instanceof NetworkError) {
          setErrorMsg(e.message);
          setErrorVisibility(true);
        }
      });
  };

  const handleDrawerOpen = () => {
    setIsFriendsListOpen(!isFriendsListOpen);
  };

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter((course) => course.code !== courseCode);
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => {
      prev = { ...prev };
      delete prev[courseCode];
      return prev;
    });
  };

  const handleErrorClose = () => {
    setErrorVisibility(false);
  };

  const handleInfoClose = () => {
    setInfoVisibility(false);
  };

  const handleSetIsLoggedIn = (value: boolean) => {
    setIsLoggedIn(value);
  };

  useEffect(() => {
    storage.set('is12HourMode', is12HourMode);
  }, [is12HourMode]);

  useEffect(() => {
    storage.set('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    storage.set('isSquareEdges', isSquareEdges);
  }, [isSquareEdges]);

  useEffect(() => {
    storage.set('isHideFullClasses', isHideFullClasses);
  }, [isHideFullClasses]);

  useEffect(() => {
    storage.set('isDefaultUnscheduled', isDefaultUnscheduled);
  }, [isDefaultUnscheduled])

  useEffect(() => {
    storage.set('isHideClassInfo', isHideClassInfo);
  }, [isHideClassInfo])

  type ClassId = string;
  type SavedClasses = Record<CourseCode, Record<Activity, ClassId | InInventory>>;

  useEffect(() => {
    handleSelectCourse(storage.get('selectedCourses'), true, (newSelectedCourses) => {
      const savedClasses: SavedClasses = storage.get('selectedClasses');
      const newSelectedClasses: SelectedClasses = {};

      Object.keys(savedClasses).forEach((courseCode) => {
        newSelectedClasses[courseCode] = {};

        Object.keys(savedClasses[courseCode]).forEach((activity) => {
          const classId = savedClasses[courseCode][activity];
          let classData: ClassData | null = null;

          if (classId) {
            const result = newSelectedCourses
              .find((x) => x.code === courseCode)
              ?.activities[activity].find((x) => x.id === classId);

            if (result) classData = result;
          }

          newSelectedClasses[courseCode][activity] = classData;
        });
      });

      setSelectedClasses(newSelectedClasses);
    }, undefined);
  }, []);

  useUpdateEffect(() => {
    storage.set(
      'selectedCourses',
      selectedCourses.map((course) => course.code)
    );
  }, [selectedCourses]);

  useUpdateEffect(() => {
    const savedClasses: SavedClasses = {};

    Object.keys(selectedClasses).forEach((courseCode) => {
      savedClasses[courseCode] = {};
      Object.keys(selectedClasses[courseCode]).forEach((activity) => {
        const classData = selectedClasses[courseCode][activity];
        savedClasses[courseCode][activity] = classData ? classData.id : null;
      });
    });

    storage.set('selectedClasses', savedClasses);
  }, [selectedClasses]);

  // `date`: timestamp in milliseconds
  // returns: time in relative format, such as "5 minutes" (ago) or "10 hours" (ago)
  const getRelativeTime = (date: number): string => {
    const diff = Date.now() - date;
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours} hours`;
  };

  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <StyledApp>
          <Navbar
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
            handleDrawerOpen={handleDrawerOpen}
            isSquareEdges={isSquareEdges}
            setIsSquareEdges={setIsSquareEdges}
            is12HourMode={is12HourMode}
            setIs12HourMode={setIs12HourMode}
            isHideFullClasses={isHideFullClasses}
            setIsHideFullClasses={setIsHideFullClasses}
            isDefaultUnscheduled={isDefaultUnscheduled}
            setIsDefaultUnscheduled={setIsDefaultUnscheduled}
            isHideClassInfo={isHideClassInfo}
            setIsHideClassInfo={setIsHideClassInfo}
          />
          {isPreview && (
            <FriendsDrawer isFriendsListOpen={isFriendsListOpen} isLoggedIn={isLoggedIn} setIsLoggedIn={handleSetIsLoggedIn} />
          )}
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
                      setLastUpdated={handleLastUpdated}
                      isDefaultUnscheduled={isDefaultUnscheduled}
                    />
                  </SelectWrapper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autotimetabler isDarkMode={isDarkMode} />
                </Grid>
              </Grid>
              <Timetable
                selectedCourses={selectedCourses}
                selectedClasses={selectedClasses}
                assignedColors={assignedColors}
                is12HourMode={is12HourMode}
                setIs12HourMode={setIs12HourMode}
                isSquareEdges={isSquareEdges}
                clashes={checkClashes()}
                setInfoVisibility={setInfoVisibility}
                isHideFullClasses={isHideFullClasses}
                isHideClassInfo={isHideClassInfo}
              />
              <Footer>
                While we try our best, Notangles is not an official UNSW site, and cannot guarantee data accuracy or reliability.
                <br />
                <br />
                Made by &gt;_ CSESoc UNSW&nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="mailto:notangles@csesoc.org.au">
                  Email
                </Link>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="https://forms.gle/rV3QCwjsEbLNyESE6">
                  Feedback
                </Link>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="https://github.com/csesoc/notangles">
                  Source
                </Link>
                {lastUpdated !== 0 && (
                  <>
                    <br />
                    <br />
                    Data last updated {getRelativeTime(lastUpdated)} ago.
                  </>
                )}
              </Footer>
              <Snackbar open={errorVisibility} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert severity="error" onClose={handleErrorClose} variant="filled">
                  {errorMsg}
                </Alert>
              </Snackbar>
              <Snackbar open={infoVisibility}>
                <Alert severity="info" onClose={handleInfoClose} variant="filled">
                  {infoMsg}
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
