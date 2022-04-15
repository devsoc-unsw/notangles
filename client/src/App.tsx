import React, { useContext, useEffect } from 'react';
import { Box, Button, GlobalStyles, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { styled } from '@mui/system';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

import getCourseInfo from './api/getCourseInfo';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/Footer';
import FriendsDrawer, { drawerWidth } from './components/friends/Friends';
import Navbar from './components/navbar/Navbar';
import Timetable from './components/timetable/Timetable';
import { contentPadding, darkTheme, lightTheme } from './constants/theme';
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
} from './interfaces/Course';
import NetworkError from './interfaces/NetworkError';
import { useDrag } from './utils/Drag';
import { downloadIcsFile } from './utils/generateICS';
import storage from './utils/storage';

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
  color: ${({ theme }) => theme.palette.text.primary};
`;

const getContentWidth = (drawerOpen: boolean) => {
  let contentWidth = '1400px';
  if (isPreview) {
    contentWidth = drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%';
  }
  return contentWidth;
};

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{
  drawerOpen: boolean;
}>`
  width: ${({ drawerOpen }) => getContentWidth(drawerOpen)};
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
    background-color: ${({ theme }) => theme.palette.primary.main};
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
    setAlertMsg,
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
        const newSelectedCourses = [...selectedCourses, ...addedCourses];

        setSelectedCourses(newSelectedCourses);

        if (!noInit) addedCourses.forEach((course) => initCourse(course));
        if (callback) callback(newSelectedCourses);
      })
      .catch((e) => {
        if (e instanceof NetworkError) {
          setAlertMsg(e.message);
          setErrorVisibility(true);
        }
      });
  };

  const handleRemoveCourse = (courseCode: CourseCode) => {
    const newSelectedCourses = selectedCourses.filter((course) => course.code !== courseCode);
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => {
      prev = { ...prev };
      delete prev[courseCode];
      return prev;
    });
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

  const theme = isDarkMode ? darkTheme : lightTheme;
  const globalStyle = {
    body: {
      background: theme.palette.background.default,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      background: theme.palette.background.default,
      borderRadius: '5px',
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.palette.secondary.main,
      borderRadius: '5px',
      opacity: 0.5,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.secondary.dark,
    },
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <GlobalStyles styles={globalStyle} />
          <StyledApp>
            <Navbar />
            {isPreview && <FriendsDrawer />}
            <ContentWrapper>
              <Content drawerOpen={isFriendsListOpen}>
                <Controls
                  assignedColors={assignedColors}
                  handleSelectClass={handleSelectClass}
                  handleSelectCourse={handleSelectCourse}
                  handleRemoveCourse={handleRemoveCourse}
                />
                <Timetable assignedColors={assignedColors} clashes={checkClashes()} handleSelectClass={handleSelectClass} />
                <ICSButton onClick={() => downloadIcsFile(selectedCourses, selectedClasses)}>save to calendar</ICSButton>
                <Footer />
                <Alerts />
              </Content>
            </ContentWrapper>
          </StyledApp>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
export default App;
