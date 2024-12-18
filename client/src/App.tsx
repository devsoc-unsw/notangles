import { Box, Button, GlobalStyles, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { styled } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import getCourseInfo from './api/getCourseInfo';
import getCoursesList from './api/getCoursesList';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/footer/Footer';
import Sidebar from './components/sidebar/Sidebar';
import Sponsors from './components/Sponsors';
import Timetable from './components/timetable/Timetable';
import TimetableShared from './components/timetableShared.tsx/TimetableShared';
import { TimetableTabs } from './components/timetableTabs/TimetableTabs';
import { contentPadding, darkTheme, leftContentPadding, lightTheme, rightContentPadding } from './constants/theme';
import {
  daysLong,
  getAvailableTermDetails,
  getDefaultEndTime,
  getDefaultStartTime,
  invalidYearFormat,
  sortTerms,
  unknownErrorMessage,
} from './constants/timetable';
import { AppContext } from './context/AppContext';
import { CourseContext } from './context/CourseContext';
import { UserContext } from './context/UserContext';
import useColorMapper from './hooks/useColorMapper';
import useUpdateEffect from './hooks/useUpdateEffect';
import NetworkError from './interfaces/NetworkError';
import {
  Activity,
  ClassData,
  CourseCode,
  CourseData,
  DisplayTimetablesMap,
  InInventory,
  SelectedClasses,
  TermDataList,
} from './interfaces/Periods';
import { setDropzoneRange, useDrag } from './utils/Drag';
import { downloadIcsFile } from './utils/generateICS';
import storage from './utils/storage';
import { runSync } from './utils/syncTimetables';
import { createDefaultTimetable } from './utils/timetableHelpers';

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: ${contentPadding}px;
  padding-left: ${leftContentPadding}px;
  padding-right: ${rightContentPadding}px;
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
    setTermsData,
    setCoursesList,
    selectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    courseData,
    setCourseData,
  } = useContext(AppContext);

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

  const { user, setUser, groupsSidebarCollapsed, setGroupsSidebarCollapsed } = useContext(UserContext);

  setDropzoneRange(days.length, earliestStartTime, latestEndTime);

  /**
   * Attempts callback() several times before raising error. Intended for unreliable fetches
   */
  const maxFetchAttempts: number = 6;
  const fetchCooldown: number = 120;
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
      const { term, termName, year, firstDayOfTerm, termsData } = await getAvailableTermDetails();
      setTerm(term);
      setTermName(termName);
      setYear(year);
      setFirstDayOfTerm(firstDayOfTerm);
      const termsSortedList: TermDataList = sortTerms(termsData);
      setTermsData(termsSortedList);

      const oldData = storage.get('timetables');

      let newTimetableTerms: DisplayTimetablesMap = {};
      for (const termId of termsData) {
        newTimetableTerms = {
          ...newTimetableTerms,
          ...{
            [termId as string]: oldData.hasOwnProperty(termId as string)
              ? oldData[termId as string]
              : createDefaultTimetable(user.userID),
          },
        };
      }

      setDisplayTimetables(newTimetableTerms);
      storage.set('timetables', newTimetableTerms);
    };

    fetchReliably(fetchTermData);
  }, []);

  useEffect(() => {
    /**
     * Retrieves the list of all courses from the scraper backend
     */
    const fetchCoursesList = async () => {
      const { courses } = await getCoursesList(term.substring(0, 2));
      setCoursesList(courses);
    };

    if (year !== invalidYearFormat) fetchReliably(fetchCoursesList);
  }, [term, year]);

  // Fetching the saved timetables from local storage
  useEffect(() => {
    const savedTimetables: DisplayTimetablesMap = storage.get('timetables');
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

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
          : (course.activities[activity].find((x) => x.enrolments !== x.capacity && x.periods.length) ??
            course.activities[activity].find((x) => x.periods.length) ??
            null);
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
    callback?: (_selectedCourses: CourseData[]) => void,
  ) => {
    const codes: string[] = Array.isArray(data) ? data : [data];
    Promise.all(
      codes.map((code) =>
        getCourseInfo(term!.substring(0, 2), code, term!.substring(2), isConvertToLocalTimezone).catch((err) => {
          return err;
        }),
      ),
    ).then((result) => {
      const addedCourses = result.filter((course) => course.code !== undefined) as CourseData[];

      const newSelectedCourses = [...selectedCourses];
      const newCourseData = courseData;

      // Update the existing courses with the new data (for changing timezone).
      addedCourses.forEach((addedCourse) => {
        if (newSelectedCourses.find((x) => x.code === addedCourse.code)) {
          const index = newSelectedCourses.findIndex((x) => x.code === addedCourse.code);
          newSelectedCourses[index] = addedCourse;
          if (!courseData.map.find((i) => i.code === addedCourse.code)) {
            newCourseData.map.push(addedCourse);
          }
        } else {
          newSelectedCourses.push(addedCourse);
        }
        if (!courseData.map.find((i) => i.code === addedCourse.code)) {
          newCourseData.map.push(addedCourse);
        }
      });
      setSelectedCourses(newSelectedCourses);
      setCourseData(newCourseData);
      if (term && term in displayTimetables && displayTimetables[term].length > 0) {
        setAssignedColors(
          useColorMapper(
            newSelectedCourses.map((course) => course.code),
            assignedColors,
          ),
        );
      }

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
    const newCourseData = courseData;
    newCourseData.map = courseData.map.filter(() => {
      for (const timetable of displayTimetables[term]) {
        for (const course of timetable.selectedCourses) {
          if (course.code.localeCompare(courseCode)) {
            return true;
          }
        }
      }
      return false;
    });
    setCourseData(newCourseData);

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
    if (!storage.get('timetables')[term]) {
      // data stored in local storage not up to date with current term
      const updatedWithTerms = { [term]: storage.get('timetables') };

      storage.set('timetables', updatedWithTerms);
      setDisplayTimetables(updatedWithTerms);
    }

    if (!storage.get('timetables') || !storage.get('timetables')[term][selectedTimetable]) return;
    handleSelectCourse(
      storage.get('timetables')[term][selectedTimetable].selectedCourses.map((course: CourseData) => course.code),
      true,
      (newSelectedCourses) => {
        const timetableSelectedClasses: SelectedClasses =
          storage.get('timetables')[term][selectedTimetable].selectedClasses;

        const savedClasses: SavedClasses = {};

        Object.keys(timetableSelectedClasses).forEach((courseCode) => {
          savedClasses[courseCode] = {};
          Object.keys(timetableSelectedClasses[courseCode]).forEach((activity) => {
            const classData = timetableSelectedClasses[courseCode][activity];
            savedClasses[courseCode][activity] = classData ? classData.section : null;
          });
        });

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
      },
    );
    setCreatedEvents(storage.get('timetables')[term][selectedTimetable].createdEvents);
    setAssignedColors(storage.get('timetables')[term][selectedTimetable].assignedColors);
  };

  useEffect(() => {
    updateTimetableEvents();
  }, [year, isConvertToLocalTimezone]);

  const syncTimetables = () => {
    if (!user.userID) {
      return;
    }

    runSync(user, setUser, displayTimetables, setDisplayTimetables);
  };

  // The following three useUpdateEffects update local storage whenever a change is made to the timetable
  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].selectedCourses = selectedCourses;
    const newCourseData = courseData;
    storage.set('courseData', newCourseData);

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
    syncTimetables();
  }, [selectedCourses]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].selectedClasses = selectedClasses;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
    syncTimetables();
  }, [selectedClasses]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].createdEvents = createdEvents;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
    syncTimetables();
  }, [createdEvents]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].assignedColors = assignedColors;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
    syncTimetables();
  }, [assignedColors]);

  // Update storage when dragging timetables
  useUpdateEffect(() => {
    storage.set('timetables', displayTimetables);
    syncTimetables();
  }, [displayTimetables]);

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
   * Upon switching timetable, reset default bounds
   */
  useEffect(() => {
    setEarliestStartTime(getDefaultStartTime(isConvertToLocalTimezone));
    setLatestEndTime(getDefaultEndTime(isConvertToLocalTimezone));
  }, [selectedTimetable]);

  /**
   *  Update the bounds of the timetable (start time, end time, number of days) whenever a change is made to the timetable
   */
  const updateTimetableDaysAndTimes = () => {
    setEarliestStartTime((prev: number) =>
      Math.min(
        ...selectedCourses.map((course) => course.earliestStartTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.floor(eventPeriod.time.start)),
        getDefaultStartTime(isConvertToLocalTimezone),
        prev,
      ),
    );

    setLatestEndTime((prev: number) =>
      Math.max(
        ...selectedCourses.map((course) => course.latestFinishTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.ceil(eventPeriod.time.end)),
        getDefaultEndTime(isConvertToLocalTimezone),
        prev,
      ),
    );

    setDays(
      daysLong.slice(
        0,
        Math.max(
          getLatestDotW(selectedCourses),
          ...Object.entries(createdEvents).map(([_, eventPeriod]) => eventPeriod.time.day),
          days.length, // Saturday and/or Sunday columns persist until the next reload even if they aren't needed anymore
          5, // default
        ),
      ),
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
            <Sidebar />
            <ContentWrapper>
              <Content>
                <Controls
                  assignedColors={assignedColors}
                  handleSelectClass={handleSelectClass}
                  handleSelectCourse={handleSelectCourse}
                  handleRemoveCourse={handleRemoveCourse}
                />
                <Outlet />
                {groupsSidebarCollapsed ? (
                  <>
                    <TimetableTabs />
                    <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
                  </>
                ) : (
                  <TimetableShared assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
                )}
                <ICSButton
                  onClick={() => downloadIcsFile(selectedCourses, createdEvents, selectedClasses, firstDayOfTerm)}
                >
                  save to calendar
                </ICSButton>
                <Sponsors />
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
