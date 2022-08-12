import { Box, Button, GlobalStyles, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { styled } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import React, { useContext, useEffect } from 'react';

import getCourseInfo from './api/getCourseInfo';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/Footer';
import Navbar from './components/navbar/Navbar';
import Timetable from './components/timetable/Timetable';
import { contentPadding, darkTheme, lightTheme } from './constants/theme';
import {
  defaultEndTime,
  defaultStartTime,
  getAvailableTermDetails,
  unknownErrorMessage,
  weekdaysLong,
} from './constants/timetable';
import { AppContext } from './context/AppContext';
import { CourseContext } from './context/CourseContext';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import { Activity, ClassData, CourseCode, CourseData, InInventory, SelectedClasses } from './interfaces/Periods';
import { setDropzoneRange, useDrag } from './utils/Drag';
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
    isShowOnlyOpenClasses,
    isDefaultUnscheduled,
    isHideClassInfo,
    isHideExamClasses,
    setAlertMsg,
    setErrorVisibility,
    infoVisibility,
    days,
    term,
    year,
    setInfoVisibility,
    setDays,
    earliestStartTime,
    setEarliestStartTime,
    latestEndTime,
    setLatestEndTime,
    setTerm,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    setTermName,
    setTermNumber,
  } = useContext(AppContext);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);

  if (infoVisibility) {
    if (storage.get('hasShownInfoMessage')) {
      setInfoVisibility(false);
    }

    storage.set('hasShownInfoMessage', true);
  }

  setDropzoneRange(days.length, earliestStartTime, latestEndTime);

  const assignedColors = useColorMapper(selectedCourses.map((course) => course.code));

  const handleSelectClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };

      try {
        prev[classData.courseCode][classData.activity] = classData;
      } catch (err) {
        setAlertMsg(unknownErrorMessage);
        setErrorVisibility(true);
      }

      return prev;
    });
    console.log(classData);
  };

  const handleRemoveClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.courseCode][classData.activity] = null;
      return prev;
    });
  };

  useDrag(handleSelectClass, handleRemoveClass);

  const initCourse = (course: CourseData) => {
    setSelectedClasses((prevRef) => {
      const prev = { ...prevRef };

      prev[course.code] = {};

      // null means a class is unscheduled
      Object.keys(course.activities).forEach((activity) => {
        prev[course.code][activity] = isDefaultUnscheduled
          ? null
          : course.activities[activity].find((x) => x.enrolments !== x.capacity && x.periods.length) ??
            course.activities[activity].find((x) => x.periods.length) ??
            null;
      });

      return prev;
    });
  };

  const handleSelectCourse = async (
    data: string | string[],
    noInit?: boolean,
    callback?: (_selectedCourses: CourseData[]) => void
  ) => {
    const codes: string[] = Array.isArray(data) ? data : [data];
    Promise.all(
      codes.map((code) =>
        getCourseInfo(year, term, code).catch((err) => {
          return err;
        })
      )
    ).then((result) => {
      const addedCourses = result.filter((course) => course.code !== undefined) as CourseData[];
      const newSelectedCourses = [...selectedCourses, ...addedCourses];

      setSelectedCourses(newSelectedCourses);

      if (!noInit) addedCourses.forEach((course) => initCourse(course));
      if (callback) callback(newSelectedCourses);
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
    const fetchTermData = async () => {
      const termData = await getAvailableTermDetails();
      if (termData !== undefined) {
        const { term, termName, termNumber, firstDayOfTerm, year } = termData;
        setTerm(term);
        setTermName(termName);
        setTermNumber(termNumber);
        setYear(year);
        setFirstDayOfTerm(firstDayOfTerm);
      }
    };
    fetchTermData();
  }, []);

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
    storage.set('isShowOnlyOpenClasses', isShowOnlyOpenClasses);
  }, [isShowOnlyOpenClasses]);

  useEffect(() => {
    storage.set('isDefaultUnscheduled', isDefaultUnscheduled);
  }, [isDefaultUnscheduled]);

  useEffect(() => {
    storage.set('isHideClassInfo', isHideClassInfo);
  }, [isHideClassInfo]);

  useEffect(() => {
    storage.set('isHideExamClasses', isHideExamClasses);
  }, [isHideExamClasses]);

  type ClassId = string;
  type SavedClasses = Record<CourseCode, Record<Activity, ClassId | InInventory>>;

  useUpdateEffect(() => {
    handleSelectCourse(storage.get('selectedCourses'), true, (newSelectedCourses) => {
      const savedClasses: SavedClasses = storage.get('selectedClasses');
      const newSelectedClasses: SelectedClasses = {};

      Object.keys(savedClasses).forEach((courseCode) => {
        newSelectedClasses[courseCode] = {};
        Object.keys(savedClasses[courseCode]).forEach((activity) => {
          const classId = savedClasses[courseCode][activity];
          let classData: ClassData | null = null;

          if (classId) {
            try {
              let result = undefined;
              result = newSelectedCourses
                .find((x) => x.code === courseCode)
                ?.activities[activity].find((x) => x.section === classId);
              if (result) classData = result;
            } catch (err) {
              setAlertMsg(unknownErrorMessage);
              setErrorVisibility(true);
            }
          }

          newSelectedClasses[courseCode][activity] = classData;
        });
      });

      setSelectedClasses(newSelectedClasses);
    });

    setCreatedEvents(storage.get('createdEvents'));
  }, [year]);

  useUpdateEffect(() => {
    storage.set(
      'selectedCourses',
      selectedCourses.map((course) => course.code)
    );
  }, [selectedCourses]);

  useUpdateEffect(() => {
    storage.set('createdEvents', createdEvents);
  }, [createdEvents]);

  const getLatestDotW = (courses: CourseData[]) => {
    let maxDay: number = 5;
    for (let i = 0; i < courses.length; i++) {
      const activities = Object.values(courses[i].activities);
      for (let j = 0; j < activities.length; j++) {
        for (let k = 0; k < activities[j].length; k++) {
          const classData = activities[j][k];
          for (let l = 0; l < classData.periods.length; l++) {
            maxDay = Math.max(maxDay, classData.periods[l].time.day);
          }
        }
      }
    }
    return maxDay;
  };

  useUpdateEffect(() => {
    setEarliestStartTime(
      Math.min(
        ...selectedCourses.map((course) => course.earliestStartTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => eventPeriod.time.start),
        defaultStartTime,
        earliestStartTime
      )
    );
    setLatestEndTime(
      Math.max(
        ...selectedCourses.map((course) => course.latestFinishTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => eventPeriod.time.end),
        defaultEndTime,
        latestEndTime
      )
    );

    setDays(
      weekdaysLong.slice(
        0,
        Math.max(
          getLatestDotW(selectedCourses),
          ...Object.entries(createdEvents).map(([_, eventPeriod]) => eventPeriod.time.day),
          days.length, // Saturday and/or Sunday stays even if an event is moved to a weekday
          5 // default
        )
      )
    );
  }, [createdEvents, selectedCourses]);

  useUpdateEffect(() => {
    const savedClasses: SavedClasses = {};

    Object.keys(selectedClasses).forEach((courseCode) => {
      savedClasses[courseCode] = {};
      Object.keys(selectedClasses[courseCode]).forEach((activity) => {
        const classData = selectedClasses[courseCode][activity];
        savedClasses[courseCode][activity] = classData ? classData.section : null;
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
            <ContentWrapper>
              <Content>
                <Controls
                  assignedColors={assignedColors}
                  handleSelectClass={handleSelectClass}
                  handleSelectCourse={handleSelectCourse}
                  handleRemoveCourse={handleRemoveCourse}
                />
                <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
                <ICSButton onClick={() => downloadIcsFile(selectedCourses, createdEvents, selectedClasses, firstDayOfTerm)}>
                  save to calendar
                </ICSButton>
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

export default Sentry.withProfiler(App);
