import React, { useContext, useEffect } from 'react';
import { Box, Button, Snackbar } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { Alert } from '@material-ui/lab';
import styled from 'styled-components';

import getCourseInfo from './api/getCourseInfo';
import Autotimetabler from './components/Autotimetabler';
import CourseSelect from './components/CourseSelect';
import { drawerWidth } from './components/friends/Friends';
import Timetable from './components/timetable/Timetable';
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
import { StyledContentProps } from './interfaces/StyleProps';
import { useDrag } from './utils/Drag';
import { downloadIcsFile } from './utils/generateICS';
import storage from './utils/storage';

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
SS
  text-align: center;
`;

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
`;

const ICSButton = styled(Button)`
  && {
    min-width: 250px;
    // width: 20%;
    margin: auto;
    background-color: ${(props) => props.theme.palette.primary.main};
    color: #ffffff;
    &:hover {
      background-color: #598dff;
    }
  }
`;

const Footer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin-bottom: 25px;
`;

const App: React.FC = () => {
  const {
    isDefaultUnscheduled,
    errorMsg,
    setErrorMsg,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    isFriendsListOpen,
    lastUpdated,
    setLastUpdated,
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

  const handleLastUpdated = (date: number) => {
    setLastUpdated(date);
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
    <>
      <Content drawerOpen={isFriendsListOpen}>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <SelectWrapper>
                <CourseSelect
                  assignedColors={assignedColors}
                  handleSelect={handleSelectCourse}
                  handleRemove={handleRemoveCourse}
                />
              </SelectWrapper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Autotimetabler />
            </Grid>
          </Grid>
          <Timetable assignedColors={assignedColors} clashes={checkClashes()} handleSelectClass={handleSelectClass} />
          <br />
          <ICSButton onClick={() => downloadIcsFile(selectedCourses, selectedClasses)}>save to calendar</ICSButton>
        </div>
        <br />
        <br />
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
            Press and hold to drag a class
          </Alert>
        </Snackbar>
      </Content>
    </>
  );
};
export default App;
