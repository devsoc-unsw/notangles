import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Button, Dialog, IconButton, Typography } from '@mui/material';
import storage from '../../utils/storage';
import { StyledDialogButtons, StyledDialogContent, StyledDialogTitle, StyledTitleContainer, StyledTopIcons } from '../../styles/ControlStyles';
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

  const flag = "flag=level{using_notangles_is_ez}";

  const checkTimetables = () => {
    if (displayTimetables.length === 3 &&! flagShown) {
        let doesArts : Boolean = false;
        let doesComm : Boolean = false;
        let doesComp : Boolean = false;
        const timetables = storage.get('timetables');
        for (let timetable of timetables) {
            for (let course of timetable.selectedCourses) {
                if (course.code === "ARTS1631") {
                    console.log("does arts");
                    doesArts = true;
                }
                if (course.code === "COMM1140") {
                    console.log("does comm");
                    doesComm = true;
                }
                if (course.code === "COMP1511") {
                    console.log("does comp");
                    doesComp = true;
                }
                if (doesArts && doesComm && doesComp) {
                    setFlagDialogOpen(true);
                }
            }
        }
    }
  };

  const handleDialogClose = () => {
    setFlagDialogOpen(false);
    setFlagShown(true);
  }

  useEffect (() => {
    checkTimetables();
  }, [selectedCourses]);

  return (
  <>
    <Typography>asdfasdf</Typography>
    <Dialog
    maxWidth="xs"
    open={flagDialogOpen}
    onClose={handleDialogClose}
    >
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
  </>);

};

export default TimetablesFlag;