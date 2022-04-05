import React, { useContext, useEffect, useRef } from 'react';
import { Box, Button, MuiThemeProvider, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import DateFnsUtils from '@date-io/date-fns';

import getCourseInfo from './api/getCourseInfo';
import Header from './components/Controls';
import FriendsDrawer, { drawerWidth } from './components/friends/Friends';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Timetable from './components/timetable/Timetable';
import { contentPadding, darkTheme, lightTheme, ThemeType } from './constants/theme';
import { isPreview, term, year } from './constants/timetable';
import { AppContext } from './context/AppContext';
import { CourseContext } from './context/CourseContext';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import {
  Activity,
  ClassData,
  ClassPeriod,
  ClassTime,
  CourseCode,
  CourseData,
  InInventory,
  SelectedClasses,
  AutoData,
} from './interfaces/Course';
import NetworkError from './interfaces/NetworkError';
import { StyledContentProps } from './interfaces/StyleProps';
import { useDrag } from './utils/Drag';
import { downloadIcsFile } from './utils/generateICS';
import storage from './utils/storage';
import { stringify } from 'querystring';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

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
  min-height: 50vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: row-reverse;
  justify-content: ${isPreview ? 'flex-start' : 'center'};
  color: ${(props) => props.theme.palette.text.primary};
`;

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

const ICSButton = styled(Button)`
  && {
    min-width: 250px;
    margin: 2vh auto;
    background-color: ${(props) => props.theme.palette.primary.main};
    color: #ffffff;
    &:hover {
      background-color: #598dff;
    }
  }
`;

const App: React.FC = () => {
  const {
    is12HourMode,
    isDarkMode,
    isSquareEdges,
    isHideFullClasses,
    isDefaultUnscheduled,
    isHideClassInfo,
    isSortAlphabetic,
    errorMsg,
    setErrorMsg,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    isFriendsListOpen,
    days,
    setDays,
  } = useContext(AppContext);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses } = useContext(CourseContext);

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

  useDrag(handleSelectClass, handleRemoveClass);

  const initCourse = (course: CourseData) => {
    setSelectedClasses((prevRef) => {
      const prev = { ...prevRef };

      prev[course.code] = {};

      Object.keys(course.activities).forEach((activity) => {
        // temp until auto timetabling works
        prev[course.code][activity] = isDefaultUnscheduled
          ? null
          : course.activities[activity].find((x) => x.enrolments !== x.capacity) ?? null; // null for unscheduled
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
    callback?: (_selectedCourses: CourseData[]) => void
  ) => {
    const codes: string[] = Array.isArray(data) ? data : [data];
    Promise.all(codes.map((code) => getCourseInfo(year, term, code)))
      .then((result) => {
        const addedCourses = result as CourseData[];
        const newSelectedCourses = [...selectedCourses, ...addedCourses].slice(0, 3);


        setSelectedCourses(newSelectedCourses);

        if (!noInit) addedCourses.forEach((course) => initCourse(course));
        if (callback) callback(newSelectedCourses);
      })
      .catch((e) => {
        if (e instanceof NetworkError) {
          setErrorMsg(e.message);
          setErrorVisibility(true);
        }
      });
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

  useEffect(() => {
    storage.set('is12HourMode', is12HourMode);
  }, [is12HourMode]);

  useEffect(() => {
    storage.set('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    storage.set('isSortAlphabetic', isSortAlphabetic);
  }, [isSortAlphabetic]);

  useEffect(() => {
    storage.set('isSquareEdges', isSquareEdges);
  }, [isSquareEdges]);

  useEffect(() => {
    storage.set('isHideFullClasses', isHideFullClasses);
  }, [isHideFullClasses]);

  useEffect(() => {
    storage.set('isDefaultUnscheduled', isDefaultUnscheduled);
  }, [isDefaultUnscheduled]);

  useEffect(() => {
    storage.set('isHideClassInfo', isHideClassInfo);
  }, [isHideClassInfo]);

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
    });
  }, []);

  useUpdateEffect(() => {
    storage.set(
      'selectedCourses',
      selectedCourses.map((course) => course.code)
    );
    if (
      selectedCourses.some((v) =>
        Object.entries(v.activities).some(([a, b]) => b.some((vv) => vv.periods.some((vvv) => vvv.time.day === 6)))
      )
    ) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    } else if (days.length !== 5) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    }
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

  const targetActivities = useRef<ClassData[][]>([]);
  const periodsListSerialized = useRef<string[]>([]);
  const [autotimetableStatus, setAutotimetableStatus] = React.useState<null|string>(null);
  useEffect(() => {
    console.log(selectedCourses)
    if (selectedCourses && selectedCourses.length) {
      targetActivities.current = selectedCourses.map((v) =>
      Object.entries(v.activities)
        .filter(([a, b]) => !a.startsWith('Lecture') && !a.startsWith('Exam'))).reduce((a, b) => {return a.concat(b)}).map(([a, b]) => b);
      // a list of [all_periods, in_person_periods, online_periods]
      const hasMode: Array<[boolean, boolean]> = targetActivities.current.map(a => [a.some(v => v.periods.some(p => p.locations.length && ('Online' !== p.locations[0]))), a.some(v => v.periods.some(p => p.locations.length && ('Online' === p.locations[0])))])
      console.log(hasMode)
      periodsListSerialized.current = [JSON.stringify(targetActivities.current.map((value) => (value.map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end]))))),
      JSON.stringify(targetActivities.current.map((value, index) => (value.filter(v => !hasMode[index][0] || v.periods.some(p => p.locations.length && ('Online' !== p.locations[0]))).map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end]))))),
      JSON.stringify(targetActivities.current.map((value, index) => (value.filter(v => !hasMode[index][1] || v.periods.some(p => p.locations.length && ('Online' === p.locations[0]))).map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end])))))];
      console.log(periodsListSerialized.current)
    }
  }, [selectedCourses]) 
  
  const doAutoRequest = async (data: any): Promise<number[]> => {
    try {
      const rawResponse = await fetch('http://localhost:3001/auto', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const res = rawResponse;
      if (res.status !== 200) {
        setAutotimetableStatus("Couldn't get response.")
        return []
      }
      const content = await res.json();
      setAutotimetableStatus(content.given.length ? 'Success!' : 'No timetable found.')
      return content.given
    } catch (error) {
      setAutotimetableStatus("Couldn't get response.")
      console.log(autotimetableStatus)
      return []
    }
  }

  const auto = async (values: any, mode: string) => {
    const rightLocation = (aClass: ClassData) => {
      return mode === 'hybrid' || aClass.periods.some(p => p.locations.length && ( (mode === 'online') === ('Online' === p.locations[0])));
    }
    if (selectedCourses && selectedCourses.length) {
      const obj: {[k: string]: any} = ['start', 'end', 'days', 'gap', 'maxdays'].map((k, index) => [k, values[index]]).reduce((o, key) => ({ ...o, [key[0]]: key[1]}), {}) 
      obj["periodsListSerialized"] = periodsListSerialized.current[['hybrid', 'in person', 'online'].findIndex(v => v === mode)]
      doAutoRequest(obj).then((Rarray) => {
        console.log(autotimetableStatus)
        // if (autotimetableStatus === null) {setAutotimetableStatus(Rarray.length ? 'Success!' : 'No timetable found.');}

        Rarray.forEach((timeAsNum, index) => {
          const [day, start] = [Math.floor(timeAsNum / 100), (timeAsNum % 100) / 2]
          const k = targetActivities.current[index].find(c => rightLocation(c) && c.periods.length && c.periods[0].time.day === day && c.periods[0].time.start === start)
          if (k !== undefined) {
            handleSelectClass(k)
          }
        })
      });
    }
  }


  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <GlobalStyle />
        <StyledApp>
          <Navbar />
          {isPreview && <FriendsDrawer />}
          <ContentWrapper>
            <Content drawerOpen={isFriendsListOpen}>
              <Header
                auto={auto}
                assignedColors={assignedColors}
                handleSelectCourse={handleSelectCourse}
                handleRemoveCourse={handleRemoveCourse}
              />
              <Timetable assignedColors={assignedColors} clashes={checkClashes()} handleSelectClass={handleSelectClass} />
              <ICSButton onClick={() => downloadIcsFile(selectedCourses, selectedClasses)}>save to calendar</ICSButton>
              <Footer />
              <Snackbar open={errorVisibility} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert severity="error" onClose={handleErrorClose} variant="filled">
                  {errorMsg}
                </Alert>
              </Snackbar>
              <Snackbar open={infoVisibility}>
                <Alert severity="info" onClose={handleInfoClose} variant="filled">
                  Press and hold to drag a class
                </Alert>
              </Snackbar>
              <Snackbar open={autotimetableStatus !== null} autoHideDuration={2000} onClose={() => {setAutotimetableStatus(null)}}>
                <Alert severity={autotimetableStatus === 'Success!' ? 'success' : 'error'} onClose={() => {setAutotimetableStatus(null)}} variant="filled">
                {autotimetableStatus}
                </Alert>
              </Snackbar>
            </Content>
          </ContentWrapper>
        </StyledApp>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
export default App;
