import React, { useContext, useEffect, useRef, useState } from 'react';
import { AccessTime, Close, DesktopMac, LocationOn, PeopleAlt } from '@mui/icons-material';
import { Dialog, FormControl, Grid, IconButton, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { AppContext } from '../../context/AppContext';
import { ClassPeriod, ClassTime, DuplicateClassData, Location, Section } from '../../interfaces/Periods';
import { ExpandedClassViewProps, LocationDropdownProps } from '../../interfaces/PropTypes';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import { to24Hour } from '../../utils/convertTo24Hour';
import { isScheduledPeriod } from '../../utils/Drag';

const StyledDropdownContainer = styled(Grid)`
  flex-grow: 1;
`;

const getTimeData = (time: ClassTime, days: string[]) => {
  return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ');
};

const LocationDropdown: React.FC<LocationDropdownProps> = ({ selectedIndex, sectionsAndLocations, handleChange }) => {
  return (
    <FormControl fullWidth>
      <Select
        labelId="simple-select"
        id="simple-select"
        variant="outlined"
        value={selectedIndex}
        inputProps={{ 'aria-label': 'Without label' }}
        onChange={handleChange}
      >
        {sectionsAndLocations.map(([, location], index) => (
          <MenuItem value={index} key={index}>
            <Typography>{location}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const isDuplicate = (a: ClassPeriod, b: ClassPeriod) =>
  a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;

const getDuplicateClassData = (c: ClassPeriod) => {
  const periodIndex = c.class.periods.findIndex((p) => isDuplicate(p, c));

  const duplicateClasses = c.class.course.activities[c.class.activity].filter((value) =>
    value.periods.some((v, index) => index === periodIndex && isDuplicate(v, c))
  );
  const sectionsAndLocations: Array<[Section, Location]> = duplicateClasses.map((dc) => [
    dc.section,
    dc.periods[periodIndex].locations.at(0) ?? '',
  ]);

  return {
    duplicateClasses: duplicateClasses,
    sectionsAndLocations: sectionsAndLocations,
    periodIndex: periodIndex,
  } as DuplicateClassData;
};

/*
Displays expanded view of a droppedClass and allows for changing a class to others that occur at the same time period.
the LocationDropdown shows the different locations and allows the choosing of other classes at this time slot.
ExpandedView keeps an interenal reference of the currently selected class/period to display the changes from dropdown-selecting different classes, but it call a 'selectClass' function with
each change to this internal reference. Instead the new chosen class is officially selected when the ExpandedView is closed and handled by the handleClose function of its parent. This is done
becuase otherwise the view will close itself whenever a new item is selected in the locations dropdown.

Currently only intended to be appear on non-unscheduled classCards -- i.e. classPeriod but technically be of type PeriodData
*/
const ExpandedClassView: React.FC<ExpandedClassViewProps> = ({ classPeriod, popupOpen, handleClose }) => {
  const [currentPeriod, setCurrentPeriod] = useState<ClassPeriod>(classPeriod); // the period currently being used to display data from -- gets changed when a class is selected in dropdown and when classPeriod changes.
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // index of the currently selected class in sectionsAndLocations array; defaults as 0 but it's real initial value is set by the useEffect anyway (most likely ends up 0 however to start with)

  const { days } = useContext(AppContext);

  const duplicateClassData = useRef<DuplicateClassData>(getDuplicateClassData(classPeriod)); // the relevant data to handle class changing with location dropdown

  useEffect(() => {
    // updates the data when changing to another time slot -- e.g. dragging the card around
    if (!isScheduledPeriod(classPeriod)) return;

    setCurrentPeriod(classPeriod);
    duplicateClassData.current = getDuplicateClassData(classPeriod); // current sectionsAndLocations has to be recalculated here otherwise the following line will use the unupdated value
    setSelectedIndex(
      duplicateClassData.current.sectionsAndLocations.findIndex(([section]) => section === classPeriod.class.section)
    ); // makes selected item in new initial location dropdown the right one
  }, [classPeriod]);

  const handleLocationChange = (e: SelectChangeEvent<number>) => {
    // updates index and current period when selected with dropdown
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
      <StyledDialogTitle>
        <StyledTitleContainer>
          {classPeriod.class.course.code} — {classPeriod.class.course.name}
          <IconButton aria-label="close" onClick={() => handleClose(duplicateClassData.current.duplicateClasses[selectedIndex])}>
            <Close />
          </IconButton>
        </StyledTitleContainer>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <DesktopMac />
            </Grid>
            <Grid item>
              <Typography>
                {classPeriod && classPeriod.class.activity} (
                {classPeriod && duplicateClassData.current.sectionsAndLocations.at(selectedIndex)?.at(0)})
              </Typography>
            </Grid>
          </Grid>
          <Grid item container direction="row" spacing={2} wrap="nowrap">
            <Grid item>
              <AccessTime />
            </Grid>
            <Grid item>
              <Typography>{currentPeriod && getTimeData(currentPeriod.time, days)}</Typography>
            </Grid>
          </Grid>
          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <LocationOn />
            </Grid>
            <StyledDropdownContainer item>
              <LocationDropdown
                selectedIndex={selectedIndex}
                sectionsAndLocations={duplicateClassData.current.sectionsAndLocations}
                handleChange={handleLocationChange}
              />
            </StyledDropdownContainer>
          </Grid>
          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <PeopleAlt />
            </Grid>
            <Grid item>
              <Typography>
                Capacity {currentPeriod?.class.enrolments} / {currentPeriod?.class.capacity}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedClassView;
