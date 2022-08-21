import React, { useContext, useEffect } from 'react';
import { Box, Button, GlobalStyles, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { styled } from '@mui/system';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import * as Sentry from '@sentry/react';

import getCourseInfo from './api/getCourseInfo';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/Footer';
import Navbar from './components/navbar/Navbar';
import Timetable from './components/timetable/Timetable';
import { contentPadding, darkTheme, lightTheme } from './constants/theme';
import { getAvailableTermDetails } from './constants/timetable';
import { AppContext } from './context/AppContext';
import { CourseContext } from './context/CourseContext';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import { Activity, ClassData, ClassTime, CourseCode, CourseData, InInventory, SelectedClasses } from './interfaces/Course';
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
    infoVisibility,
    days,
    term,
    year,
    setInfoVisibility,
    setDays,
    setTerm,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    setTermName,
    setTermNumber,
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
            const result = newSelectedCourses
              .find((x) => x.code === courseCode)
              ?.activities[activity].find((x) => x.section === classId);

            if (result) classData = result;
          }

          newSelectedClasses[courseCode][activity] = classData;
        });
      });

      setSelectedClasses(newSelectedClasses);
    });
  }, [year]);

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
                <ICSButton onClick={() => downloadIcsFile(selectedCourses, selectedClasses, firstDayOfTerm)}>
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
