import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Button, Dialog, IconButton, Typography } from '@mui/material';
import storage from '../../utils/storage';
import {
  StyledDialogButtons,
  StyledDialogContent,
  StyledDialogTitle,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../styles/ControlStyles';
import { Close } from '@mui/icons-material';

const TimetablesFlag: React.FC = () => {
  const {
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setAlertFunction,
    alertFunction,
    setErrorVisibility,
  } = useContext(AppContext);

  const { selectedCourses, selectedClasses } = useContext(CourseContext);

  const [flagShown, setFlagShown] = useState<boolean>(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState<boolean>(false);

  const flag = 'levelup{using_notangles_is_ez}';
  const coursesOfInterest: string[] = ['ARTS1631', 'COMM1140', 'COMP1511'];
  interface CourseMap {
    name: string;
    timetableMapped: number[];
    // ARTS1631: number[];
    // COMM1140: number[];
    // COMP1511: number[];
  }
  const isValidWin = (initData: CourseMap[]): boolean => {
    if (initData.length !== 3) return false;
    initData.sort((a, b) => a.timetableMapped.length - b.timetableMapped.length);
    // Greedy matching

    let timetablesIdsUsed: number[] = [];
    let timetableMatched: { name: string; idMatched: number }[] = [];
    for (const course of initData) {
      for (const timetableId of course.timetableMapped) {
        if (!timetablesIdsUsed.includes(timetableId)) {
          timetablesIdsUsed.push(timetableId);
          timetableMatched.push({ name: course.name, idMatched: timetableId });
          break;
        }
      }
    }
    if (timetableMatched.length !== 3) return false;

    return true;
  };

  const checkTimetables = () => {
    let initData: CourseMap[] = [
      { name: 'ARTS1631', timetableMapped: [] },
      { name: 'COMM1140', timetableMapped: [] },
      { name: 'COMP1511', timetableMapped: [] },
    ];
    if (!flagShown) {
      const timetables = storage.get('timetables');

      timetables.forEach((timetable: any, idx: number) => {
        if (timetable.selectedCourses.length === 1) {
          for (const course of timetable.selectedCourses) {
            if (coursesOfInterest.includes(course.code)) {
              const courseToBeAdded = initData.find((currCourse) => currCourse.name === course.code);
              courseToBeAdded?.timetableMapped.push(idx);
            }
          }
        }
      });
    }
    if (isValidWin(initData) && !flagShown) {
      setFlagDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setFlagDialogOpen(false);
    setFlagShown(true);
  };
  let timetables = storage.get('timetables');
  useEffect(() => {
    checkTimetables();
  }, [selectedCourses, timetables]);

  return (
    <>
      <Dialog maxWidth="xs" open={flagDialogOpen} onClose={handleDialogClose}>
        <StyledTopIcons>
          <IconButton aria-label="close" onClick={() => handleDialogClose()}>
            <Close />
          </IconButton>
        </StyledTopIcons>
        <StyledTitleContainer>
          <StyledDialogContent>{flag}</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button onClick={handleDialogClose}>🥳 Got it!</Button>
        </StyledDialogButtons>
      </Dialog>
    </>
  );
};

export default TimetablesFlag;
