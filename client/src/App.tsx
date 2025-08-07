import { Box, Button, GlobalStyles, ThemeProvider } from '@mui/material';
import { styled, StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import React, { useContext, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import getCourseInfo from './api/getCourseInfo';
import getCoursesList from './api/getCoursesList';
import { useGetUserSettingsQuery } from './api/user/queries';
import T3SelectGif from './assets/T3-select.gif';
import Alerts from './components/Alerts';
import Controls from './components/controls/Controls';
import Footer from './components/footer/Footer';
import PromotionPopup from './components/promotions/PromotionPopup';
import SubcomPromotion from './components/promotions/SubcomPromotion';
import Sidebar from './components/sidebar/Sidebar';
import Sponsors from './components/Sponsors';
import Timetable from './components/timetable/Timetable';
import { TimetableTabs } from './components/timetableTabs/TimetableTabs';
import { contentPadding, darkTheme, lightTheme, rightContentPadding } from './constants/theme';
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
import { useColorsDecoder } from './hooks/useColorDecoder';
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
import { createDefaultTimetable } from './utils/timetableHelpers';

const StyledApp = styled(Box)`
  height: 100%;
`;

const Container = styled(Box)`
  display: flex;
  justify-content: center;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: ${contentPadding}px;
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
  overflow: hidden;
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
  } = useContext(AppContext);

  const { selectedCourses, setSelectedCourses, setSelectedClasses, createdEvents, setCreatedEvents, setAssignedColor } =
    useContext(CourseContext);

  const { preferredTheme, isDarkMode, unscheduleClassesByDefault, convertToLocalTimezone } = useGetUserSettingsQuery();

  const decodedAssignedColors = useColorsDecoder(assignedColors, preferredTheme);

  setDropzoneRange(days.length, earliestStartTime, latestEndTime);

  /**
   * Attempts callback() several times before raising error. Intended for unreliable fetches
   */
  const maxFetchAttempts = 6;
  const fetchCooldown = 120;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const fetchReliably = async (callback: () => Promise<void>) => {
    for (let attempt = 1; attempt <= maxFetchAttempts; attempt++) {
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
            [termId]: Object.prototype.hasOwnProperty.call(oldData, termId)
              ? oldData[termId]
              : createDefaultTimetable(undefined),
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
        prev[course.code][activity] = unscheduleClassesByDefault
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
        getCourseInfo(term.substring(0, 2), code, term.substring(2), convertToLocalTimezone).catch((err) => {
          return err;
        }),
      ),
    ).then((result) => {
      const addedCourses = result.filter((course) => course.code !== undefined) as CourseData[];

      const newSelectedCourses = [...selectedCourses];

      // Update the existing courses with the new data (for changing timezone).
      addedCourses.forEach((addedCourse) => {
        if (newSelectedCourses.find((x) => x.code === addedCourse.code)) {
          const index = newSelectedCourses.findIndex((x) => x.code === addedCourse.code);
          newSelectedCourses[index] = addedCourse;
        } else {
          newSelectedCourses.push(addedCourse);
        }
      });
      setSelectedCourses(newSelectedCourses);
      if (term && term in displayTimetables && displayTimetables[term].length > 0) {
        setAssignedColors(
          useColorMapper(
            newSelectedCourses.map((course) => course.code),
            assignedColors,
          ),
        );
      }

      if (!noInit)
        addedCourses.forEach((course) => {
          initCourse(course);
        });
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
    if (!storage.get('timetables')[term]) {
      // data stored in local storage not up to date with current term
      const updatedWithTerms = { [term]: storage.get('timetables') };

      storage.set('timetables', updatedWithTerms);
      setDisplayTimetables(updatedWithTerms);
    }

    if (!storage.get('timetables')?.[term][selectedTimetable]) return;
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
  }, [year, convertToLocalTimezone]);

  // The following three useUpdateEffects update local storage whenever a change is made to the timetable
  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].selectedCourses = selectedCourses;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
  }, [selectedCourses]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].selectedClasses = selectedClasses;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
  }, [selectedClasses]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].createdEvents = createdEvents;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
  }, [createdEvents]);

  useUpdateEffect(() => {
    displayTimetables[term][selectedTimetable].assignedColors = assignedColors;

    storage.set('timetables', displayTimetables);
    setDisplayTimetables(displayTimetables);
  }, [assignedColors]);

  // Update storage when dragging timetables
  useUpdateEffect(() => {
    storage.set('timetables', displayTimetables);
  }, [displayTimetables]);

  /**
   * Get the latest day of the week a course has classes on
   * The first day of the week is considered to be Monday
   *
   * @param courses The list of the currently selected courses
   * @returns A number corresponding to the latest day of the week. Monday is 1, Tuesday is 2 and so on
   */
  const getLatestDotW = (courses: CourseData[]) => {
    let maxDay = 5;
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
    setEarliestStartTime(getDefaultStartTime(convertToLocalTimezone));
    setLatestEndTime(getDefaultEndTime(convertToLocalTimezone));
  }, [selectedTimetable]);

  /**
   *  Update the bounds of the timetable (start time, end time, number of days) whenever a change is made to the timetable
   */
  const updateTimetableDaysAndTimes = () => {
    setEarliestStartTime((prev: number) =>
      Math.min(
        ...selectedCourses.map((course) => course.earliestStartTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.floor(eventPeriod.time.start)),
        getDefaultStartTime(convertToLocalTimezone),
        prev,
      ),
    );

    setLatestEndTime((prev: number) =>
      Math.max(
        ...selectedCourses.map((course) => course.latestFinishTime),
        ...Object.entries(createdEvents).map(([_, eventPeriod]) => Math.ceil(eventPeriod.time.end)),
        getDefaultEndTime(convertToLocalTimezone),
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
  }, [createdEvents, selectedCourses, convertToLocalTimezone]);

  const themeObject = useMemo(
    () => (isDarkMode ? darkTheme(preferredTheme) : lightTheme(preferredTheme)),
    [isDarkMode, preferredTheme],
  );

  const globalStyle = {
    body: {
      background: themeObject.palette.background.default,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      background: themeObject.palette.background.default,
      borderRadius: '5px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeObject.palette.secondary.main,
      borderRadius: '5px',
      opacity: 0.5,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: themeObject.palette.secondary.dark,
    },
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themeObject}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <GlobalStyles styles={globalStyle} />
          <StyledApp>
            <Container>
              <Sidebar />
              <ContentWrapper>
                <Content>
                  <Controls
                    assignedColors={decodedAssignedColors}
                    handleSelectClass={handleSelectClass}
                    handleSelectCourse={handleSelectCourse}
                    handleRemoveCourse={handleRemoveCourse}
                  />
                  <Outlet />
                  <TimetableTabs />
                  <Timetable assignedColors={decodedAssignedColors} handleSelectClass={handleSelectClass} />
                  <ICSButton
                    onClick={() => downloadIcsFile(selectedCourses, createdEvents, selectedClasses, firstDayOfTerm)}
                  >
                    save to calendar
                  </ICSButton>
                  <Sponsors />
                  <Footer />
                  <Alerts />
                  <SubcomPromotion />
                  <PromotionPopup
                    imgSrc={T3SelectGif}
                    title="Next term's timetable has been released! 🎉"
                    subTitle="Organise, plan and schedule with newly released timetable"
                    bullets={[
                      {
                        main: 'Auto-timetable feature',
                        description:
                          'Automate process of manually scheduling tasks saving time and being more efficient',
                      },
                      {
                        main: 'Live data feedback',
                        description: 'Syncs with the current myUNSW class availabilities',
                      },
                      {
                        main: 'Create personal events',
                        description: 'Fully customisable and caters to your needs',
                      },
                    ]}
                  />
                </Content>
              </ContentWrapper>
            </Container>
          </StyledApp>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default Sentry.withProfiler(App);
