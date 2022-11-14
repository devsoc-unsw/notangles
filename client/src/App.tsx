import React, { useContext, useEffect } from 'react';
import { Box, Button, GlobalStyles, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { styled } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import getCourseInfo from './api/getCourseInfo';
import getCoursesList from './api/getCoursesList';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/Footer';
import Navbar from './components/navbar/Navbar';
import Timetable from './components/timetable/Timetable';
import { contentPadding, darkTheme, lightTheme } from './constants/theme';
import {
  daysLong,
  getAvailableTermDetails,
  getDefaultEndTime,
  getDefaultStartTime,
  invalidYearFormat,
  unknownErrorMessage,
} from './constants/timetable';
import { AppContext } from './context/AppContext';
import { CourseContext } from './context/CourseContext';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import NetworkError from './interfaces/NetworkError';
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
    isConvertToLocalTimezone,
    setAlertMsg,
    setErrorVisibility,
    days,
    term,
    year,
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
    setCoursesList,
    setLastUpdated,
  } = useContext(AppContext);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);

  setDropzoneRange(days.length, earliestStartTime, latestEndTime);

  /**
   * Attemps callback() several times before raising error. Intended for unreliable fetches
   */
  const maxFetchAttempts: number = 6;
  const fetchCooldown: number = 120; // milliseconds
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const fetchReliably = async (callback: () => Promise<void>) => {
    for (let attempt: number = 1; attempt <= maxFetchAttempts; attempt++) {
      try {
        await callback();
        break;
      } catch (e) {
        if (attempt !== maxFetchAttempts) {
          await sleep(fetchCooldown); // chill for a while before retrying
          continue;
        }
        if (e instanceof NetworkError) {
          setAlertMsg(e.message);
        } else {
          setAlertMsg(unknownErrorMessage);
        }
        setErrorVisibility(true);
      }
    }
  };

  useEffect(() => {
    /**
     * Retrieves term data from the scraper backend
     */
    const fetchTermData = async () => {
      const termData = await getAvailableTermDetails();
      let { term, termName, termNumber, year, firstDayOfTerm } = termData;
      setTerm(term);
      setTermName(termName);
      setTermNumber(termNumber);
      setYear(year);
      setFirstDayOfTerm(firstDayOfTerm);
    };

    fetchReliably(fetchTermData);
  }, []);

  useEffect(() => {
    /**
     * Retrieves the list of all courses from the scraper backend
     */
    const fetchCoursesList = async () => {
      const { courses, lastUpdated } = await getCoursesList(year, term);
      setCoursesList(courses);
      setLastUpdated(lastUpdated);
    };

    if (year !== invalidYearFormat) fetchReliably(fetchCoursesList);
  }, [year]);

  /**
   * Update the class data for a particular course's activity e.g. when a class is dragged to another dropzone
   *
   * @param classData The data for the new class
   */
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
  };

  /**
   * Update the class data for a particular course's activity when it is moved to unscheduled
   *
   * @param classData The data for the unscheduled class
   */
  const handleRemoveClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.courseCode][classData.activity] = null;
      return prev;
    });
  };

  useDrag(handleSelectClass, handleRemoveClass);

  /**
   * Initialise class data for a course when it is first selected
   *
   * @param course The data for the course which was selected
   */
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

  /**
   * Retrieves course info for a single course or a list of courses
   *
   * @param data The course code of the selected course (when selecting via the course selector) or a list of the course codes of the selected courses
   * @param noInit Whether to initialise the data structure for the course data
   * @param callback An optional callback function to be executed using the course data
   */
  const handleSelectCourse = async (
    data: string | string[],
    noInit?: boolean,
    callback?: (_selectedCourses: CourseData[]) => void
  ) => {
    const codes: string[] = Array.isArray(data) ? data : [data];
    Promise.all(
      codes.map((code) =>
        getCourseInfo(year, term, code, isConvertToLocalTimezone).catch((err) => {
          return err;
        })
      )
    ).then((result) => {
      const addedCourses = result.filter((course) => course.code !== undefined) as CourseData[];

      let newSelectedCourses = [...selectedCourses];

      // Update the existing courses with the new data (for changing timezones).
      addedCourses.forEach((addedCourse) => {
        if (newSelectedCourses.find((x) => x.code === addedCourse.code)) {
          const index = newSelectedCourses.findIndex((x) => x.code === addedCourse.code);
          newSelectedCourses[index] = addedCourse;
        } else {
          newSelectedCourses.push(addedCourse);
        }
      });

      setSelectedCourses(newSelectedCourses);

      if (!noInit) addedCourses.forEach((course) => initCourse(course));
      if (callback) callback(newSelectedCourses);
    });
  };

  /**
   * Handles removing a course from the currently selected courses
   *
   * @param courseCode The course code of the course which was removed
   */
  const handleRemoveCourse = (courseCode: CourseCode) => {
    const newSelectedCourses = selectedCourses.filter((course) => course.code !== courseCode);
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => {
      prev = { ...prev };
      delete prev[courseCode];
      return prev;
    });
  };

  type ClassId = string;
  type SavedClasses = Record<CourseCode, Record<Activity, ClassId | InInventory>>;

  /**
   * Populate selected courses, classes and created events with the data saved in local storage
   */
  const updateTimetableEvents = () => {
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
              const result = newSelectedCourses
                .find((x) => x.code === courseCode)
                ?.activities[activity].find((x) => x.section === classId);
              if (result) classData = result;
            } catch (err) {
              setAlertMsg(unknownErrorMessage);
              setErrorVisibility(true);
            }
          }

          // classData being null means the activity is unscheduled
          newSelectedClasses[courseCode][activity] = classData;
        });
      });
      setSelectedClasses(newSelectedClasses);
    });
    setCreatedEvents(storage.get('createdEvents'));
  };

  useEffect(() => {
    updateTimetableEvents();
  }, [year, isConvertToLocalTimezone]);

  // The following three useUpdateEffects update local storage whenever a change is made to the timetable
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
        savedClasses[courseCode][activity] = classData ? classData.section : null;
      });
    });

    storage.set('selectedClasses', savedClasses);
  }, [selectedClasses]);

  useUpdateEffect(() => {
    storage.set('createdEvents', createdEvents);
  }, [createdEvents]);

  /**
   * Get the latest day of the week a course has classes on
   * The first day of the week is considered to be Monday
   *
   * @param courses The list of the currently selected courses
   * @returns A number corresponding to the latest day of the week. Monday is 1, Tuesday is 2 and so on
   */
  const getLatestDotW = (courses: CourseData[]) => {
    let maxDay: number = 5;
    for (const course of courses) {
      const activities = Object.values(course.activities);
      for (const activity of activities) {
        for (const classData of activity) {
          for (const period of classData.periods) {
            maxDay = Math.max(maxDay, period.time.day);
          }
        }
      }
    }

    return maxDay;
  };

  /**
   *  Update the bounds of the timetable (start time, end time, number of days) whenever a change is made to the timetable
   */
  const updateTimetableDaysAndTimes = () => {
    setEarliestStartTime(
      Math.min(
        ...selectedCourses.map((course) => course.earliestStartTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.floor(eventPeriod.time.start)),
        getDefaultStartTime(isConvertToLocalTimezone),
        earliestStartTime
      )
    );

    setLatestEndTime(
      Math.max(
        ...selectedCourses.map((course) => course.latestFinishTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.ceil(eventPeriod.time.end)),
        getDefaultEndTime(isConvertToLocalTimezone),
        latestEndTime
      )
    );

    setDays(
      daysLong.slice(
        0,
        Math.max(
          getLatestDotW(selectedCourses),
          ...Object.entries(createdEvents).map(([_, eventPeriod]) => eventPeriod.time.day),
          days.length, // Saturday and/or Sunday columns persist until the next reload even if they aren't needed anymore
          5 // default
        )
      )
    );
  };

  useUpdateEffect(() => {
    updateTimetableDaysAndTimes();
  }, [createdEvents, selectedCourses, isConvertToLocalTimezone]);

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

  useEffect(() => {
    storage.set('isConvertToLocalTimezone', isConvertToLocalTimezone);
  }, [isConvertToLocalTimezone]);

  const assignedColors = useColorMapper(selectedCourses.map((course) => course.code));
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
