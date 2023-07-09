import React, { useContext, useEffect, useRef, useState } from 'react';
import { AccessTime, Close, DesktopMac, LocationOn, PeopleAlt } from '@mui/icons-material';
import { Dialog, Grid, IconButton, ListItemIcon, ListItemIconProps, SelectChangeEvent, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData, ClassPeriod, ClassTime, CourseData, DuplicateClassData, Location, Section } from '../../interfaces/Periods';
import { ExpandedClassViewProps } from '../../interfaces/PropTypes';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledListItem,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../styles/ControlStyles';
import { areDuplicatePeriods } from '../../utils/areDuplicatePeriods';
import { to24Hour } from '../../utils/convertTo24Hour';
import { isScheduledPeriod } from '../../utils/Drag';
import { getClassDataFromPeriod, getCourseFromClassData } from '../../utils/getClassCourse';
import LocationDropdown from './LocationDropdown';
import ColorPicker from '../controls/ColorPicker';

const StyledDropdownContainer = styled(Grid)`
  flex-grow: 1;
`;

const StyledListItemIcon = styled(ListItemIcon)<ListItemIconProps & { isDarkMode: boolean }>`
  color: ${(props) => (props.isDarkMode ? '#FFFFFF' : '#212121')};
`;

/**
 * @param time When the class runs
 * @param days A list containing the long forms of the days of the week (e.g. Monday, Tuesday etc.)
 * @returns A string detailing when a class runs
 */
const getTimeData = (time: ClassTime, days: string[]) => {
  return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ');
};

/*
  Displays expanded view of a droppedClass and allows for changing a class to others that occur at the same time period.
  The LocationDropdown shows the different locations and allows the choosing of other classes at this time slot.
  ExpandedView keeps an internal reference of the currently selected class/period to display the changes from selecting different classes from the dropdown,
  but it calls a 'selectClass' function with each change to this internal reference.
  The new chosen class is officially selected when the ExpandedView is closed and handled by the handleClose function of its parent.
  This is done because otherwise the view will close itself whenever a new item is selected in the locations dropdown.

  This is currently only intended to be appear on non-unscheduled classCards -- i.e. classPeriod but technically of type PeriodData
*/
const ExpandedClassView: React.FC<ExpandedClassViewProps> = ({ code, classPeriod, popupOpen, handleClose }) => {
  const [currentPeriod, setCurrentPeriod] = useState<ClassPeriod>(classPeriod); // the period currently being used to display data from -- gets changed when a class is selected in dropdown and when classPeriod changes.
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // index of the currently selected class in sectionsAndLocations array; defaults as 0 but it's real initial value is set by the useEffect anyway (most likely ends up 0 however to start with)

  const { days, isDarkMode, setAlertMsg, setErrorVisibility } = useContext(AppContext);
  const { selectedCourses, assignedColors, setAssignedColors } = useContext(CourseContext);
  const [color, setColor] = useState<string>(assignedColors[code]);

  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);

  // To reload initial color picker after useColorMapper instantiates context
  useEffect(() => {
    setColor(assignedColors[code]);
  }, [assignedColors]);

  // Bit of a hack to make color picker smoother - only update assigned colors upon closing color picker
  useEffect(() => {
    setAssignedColors({...assignedColors, [code]: color});
   }, [colorPickerAnchorEl]);


  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };
  /**
   * @param currPeriod The currently selected period
   * @param courses The currently selected courses
   * @returns Information about all the periods which are duplicates with the current period
   * A period is a duplicate of another if they both occur at the same time and day but in a different location
   */
  const getDuplicateClassData = (currPeriod: ClassPeriod, courses: CourseData[]) => {
    const defaultValues: DuplicateClassData = {
      duplicateClasses: [],
      sectionsAndLocations: [],
      periodIndex: 0,
    };

    try {
      const currCourse = getCourseFromClassData(courses, currPeriod);
      const currClass = getClassDataFromPeriod(courses, currPeriod);

      const periodIndex = currClass.periods.findIndex((period) => areDuplicatePeriods(period, currPeriod));

      const duplicateClasses = currCourse.activities[currPeriod.activity].filter((classData) =>
        classData.periods.some((period, index) => index === periodIndex && areDuplicatePeriods(period, currPeriod))
      );

      const sectionsAndLocations: Array<[Section, Location]> = duplicateClasses.map((duplicate) => [
        duplicate.section,
        duplicate.periods[periodIndex].locations.at(0) ?? '',
      ]);

      return { duplicateClasses, sectionsAndLocations, periodIndex } as DuplicateClassData;
    } catch (err) {
      setAlertMsg(unknownErrorMessage);
      setErrorVisibility(true);
      return defaultValues;
    }
  };

  let currClass: ClassData | null = null;

  try {
    currClass = getClassDataFromPeriod(selectedCourses, classPeriod);
  } catch (err) {
    setAlertMsg(unknownErrorMessage);
    setErrorVisibility(true);
  }

  if (!currClass) return <></>;

  const duplicateClassData = useRef<DuplicateClassData>(getDuplicateClassData(classPeriod, selectedCourses));

  useEffect(() => {
    // Updates the data when changing to another time slot e.g. dragging the card around
    if (!isScheduledPeriod(classPeriod)) return;

    setCurrentPeriod(classPeriod);

    // The current sectionsAndLocations has to be recalculated here otherwise setSelectedIndex will use the unupdated value
    const duplicateClasses = getDuplicateClassData(classPeriod, selectedCourses);
    duplicateClassData.current = duplicateClasses;

    // Update the value of the location dropdown
    setSelectedIndex(
      duplicateClassData.current.sectionsAndLocations.findIndex(([section]) => currClass && section === currClass.section)
    );
  }, [classPeriod]);

  /**
   * Updates index and current period when selected with dropdown
   * @param e The HTML event triggered
   */
  const handleLocationChange = (e: SelectChangeEvent<number>) => {
    setSelectedIndex(e.target.value as number);
    const newPeriod =
      duplicateClassData.current.duplicateClasses[e.target.value as number].periods[duplicateClassData.current.periodIndex];
    if (isScheduledPeriod(newPeriod)) setCurrentPeriod(newPeriod);
  };

  return (
    <Dialog
      maxWidth="sm"
      open={popupOpen}
      onClose={() => handleClose(duplicateClassData.current.duplicateClasses[selectedIndex])}
    >
      <StyledTopIcons>
        <IconButton aria-label="close" onClick={() => handleClose(duplicateClassData.current.duplicateClasses[selectedIndex])}>
          <Close />
        </IconButton>
      </StyledTopIcons>
      <StyledDialogTitle>
        <StyledTitleContainer>
          {currClass.courseCode} — {currClass.courseName}
        </StyledTitleContainer>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledListItem>
          <StyledListItemIcon isDarkMode={isDarkMode}>
            <DesktopMac />
          </StyledListItemIcon>
          <Typography>
            {classPeriod && classPeriod.activity} (
            {classPeriod && duplicateClassData.current.sectionsAndLocations.at(selectedIndex)?.at(0)})
          </Typography>
        </StyledListItem>

        <StyledListItem>
          <StyledListItemIcon isDarkMode={isDarkMode}>
            <AccessTime />
          </StyledListItemIcon>
          <Typography>{currentPeriod && getTimeData(currentPeriod.time, days)}</Typography>
        </StyledListItem>

        <StyledListItem>
          <StyledListItemIcon isDarkMode={isDarkMode}>
            <LocationOn />
          </StyledListItemIcon>
          <StyledDropdownContainer item>
            <LocationDropdown
              selectedIndex={selectedIndex}
              sectionsAndLocations={duplicateClassData.current.sectionsAndLocations}
              handleChange={handleLocationChange}
            />
          </StyledDropdownContainer>
        </StyledListItem>

        <StyledListItem>
          <StyledListItemIcon isDarkMode={isDarkMode}>
            <PeopleAlt />
          </StyledListItemIcon>
          <Typography>
            Capacity {currClass.enrolments} / {currClass.capacity}
          </Typography>          
        </StyledListItem>

        <StyledListItem>         
          <ColorPicker
            color={color}
            setColor={setColor}
            colorPickerAnchorEl={colorPickerAnchorEl}
            handleOpenColorPicker={handleOpenColorPicker}
            handleCloseColorPicker={handleCloseColorPicker}
            />
        </StyledListItem>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedClassView;
