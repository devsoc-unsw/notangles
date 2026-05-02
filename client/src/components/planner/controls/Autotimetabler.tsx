import { ArrowDropDown, ArrowDropUp, Close, FlashOn, Info } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemText,
  Popover,
  Slider,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TimePicker } from '@mui/x-date-pickers';
import React, { useState } from 'react';

import { weekdaysShort } from '../../../constants/timetable';
import { StyledButtonText, StyledControlsButton } from '../../../styles/ControlStyles';
import { DropdownButton, StyledList } from '../../../styles/CustomEventStyles';
import DropdownOption from '../timetable/DropdownOption';

const InfoContainer = styled('div')`
  padding: 10px 0 0 10px;
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const StyledDatePickerLabel = styled(ListItemText)`
  align-self: center;
`;

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

type ClassMode = 'hybrid' | 'in person' | 'online';

const dateWithHour = (hour: number) => {
  const date = new Date();
  date.setHours(hour);
  return date;
};

const Autotimetabler: React.FC = () => {
  const [daysAtUni, setDaysAtUni] = useState<number>(5);
  const [breaksBetweenClasses, setBreaksBetweenClasses] = useState<number>(0);
  const [days, setDays] = useState<string[]>(weekdaysShort);
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(21);
  const [classMode, setClassMode] = useState<ClassMode>('hybrid');
  const [isOpenInfo, setIsOpenInfo] = useState(false);

  // Which element to make the popover stick to
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // Whether the popover is shown
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  const toggleIsOpenInfo = () => {
    setIsOpenInfo(!isOpenInfo);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setDays(newFormats);
  };

  const doAuto = () => {
    const selectedDays = days.map((v) => (weekdaysShort.indexOf(v) + 1).toString());
    const selectedDaysStr = selectedDays.length ? selectedDays.reduce((a, b) => a + b) : '12345';

    const autoParams: (string | number)[] = [startHour, endHour, selectedDaysStr, breaksBetweenClasses, daysAtUni];

    console.log('Auto-timetabler parameters:', autoParams);
    // TODO: Hook up autotimetabler API
    // try {
    //   const [resultsWithEvents, isOptimal] = await getAutoTimetable(timetableData);
    //   const results = resultsWithEvents.slice(0, targetActivities.current.length);

    //   setAutoVisibility(true);
    //   setAlertMsg(results.length ? (isOptimal ? 'Success!' : 'Could not satisfy perfectly') : 'No timetable found');
    // } catch (e) {
    //   if (e instanceof NetworkError) {
    //     setAutoVisibility(true);
    //     setAlertMsg("Couldn't get response");
    //   } else {
    //     setErrorVisibility(true);
    //     setAlertMsg(unknownErrorMessage);
    //   }
    // }

    setAnchorEl(null);
  };

  return (
    <StyledControlsButton>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleClick}>
        <StyledButtonText>AUTO-TIMETABLE</StyledButtonText>
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <InfoContainer>
          <Button onClick={toggleIsOpenInfo}>
            <Info />
          </Button>
        </InfoContainer>
        <Dialog
          disableScrollLock
          onClose={toggleIsOpenInfo}
          aria-labelledby="customized-dialog-title"
          open={isOpenInfo}
          fullWidth
          maxWidth="xs"
        >
          <DialogContent>
            <DialogContentText>
              <Typography>
                <p>
                  Autotimetabler uses a{' '}
                  <Link href="https://en.wikipedia.org/wiki/Constraint_programming" target="_blank">
                    constraint programming
                  </Link>{' '}
                  algorithm to allocate your classes clashlessly based on the courses and constraints you provide,
                  failing when there are no clashless solutions.
                </p>
                <p>
                  If a course lacks an <code>ONLINE</code> offering, its <code>IN PERSON</code> classes may be scheduled
                  instead, and vice-versa. <em>Currently</em>, the autotimetabler won&apos;t schedule certain types of
                  classes like Lectures.
                </p>
                <p>Autotimetabler may lack full support for certain courses.</p>
              </Typography>
              <StyledIconButton aria-label="close" onClick={toggleIsOpenInfo} size="large">
                <Close />
              </StyledIconButton>
            </DialogContentText>
          </DialogContent>
        </Dialog>
        <StyledList>
          <ListItem>
            <Grid container spacing={0}>
              <Grid container size={7}>
                <StyledDatePickerLabel primary="Earliest start time" />
              </Grid>
              <Grid size={5}>
                <TimePicker
                  views={['hours']}
                  value={dateWithHour(startHour)}
                  onChange={(e) => {
                    if (e) setStartHour(e.getHours());
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Grid container spacing={0}>
              <Grid container size={7}>
                <StyledDatePickerLabel primary="Latest end time" />
              </Grid>
              <Grid size={5}>
                <TimePicker
                  views={['hours']}
                  value={dateWithHour(endHour)}
                  onChange={(e) => {
                    if (e) setEndHour(e.getHours());
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>
          <DropdownOption
            optionName="Days"
            optionState={days}
            setOptionState={handleFormat}
            optionChoices={weekdaysShort}
            multiple={true}
            noOff
          />
          <ListItem>
            <Grid container spacing={0} sx={{ flexGrow: 1 }}>
              <Grid size={8}>
                <ListItemText primary="Breaks between classes" />
              </Grid>
              <Grid size={4}>
                <Slider
                  valueLabelDisplay="auto"
                  valueLabelFormat={(e) => e.toString() + ' hr' + (e === 1 ? '' : 's')}
                  step={1}
                  value={breaksBetweenClasses}
                  onChange={(e, v) => {
                    setBreaksBetweenClasses(v);
                  }}
                  min={0}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Grid container spacing={0} sx={{ flexGrow: 1 }}>
              <Grid size={8}>
                <ListItemText primary="Max days of Uni" />
              </Grid>
              <Grid size={4}>
                <Slider
                  valueLabelDisplay="auto"
                  step={1}
                  value={daysAtUni}
                  onChange={(_, v) => {
                    setDaysAtUni(v);
                  }}
                  min={1}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>
          <DropdownOption
            optionName="Mode"
            optionState={classMode}
            setOptionState={(c: ClassMode) => {
              setClassMode(c);
            }}
            optionChoices={['hybrid', 'in person', 'online']}
            noOff
          />
        </StyledList>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={doAuto}>
          <FlashOn />
          GO
        </ExecuteButton>
      </Popover>
    </StyledControlsButton>
  );
};

export default Autotimetabler;
