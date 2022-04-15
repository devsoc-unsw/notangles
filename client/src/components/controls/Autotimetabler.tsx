import React, { useContext, useEffect, useRef, useState } from 'react';
import { ArrowDropDown, ArrowDropUp, Close, FlashOn, Info } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Popover,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TextField,
} from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';

import getAutoTimetable from '../../api/getAutoTimetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData } from '../../interfaces/Course';
import NetworkError from '../../interfaces/NetworkError';
import { AutotimetableProps, DropdownOptionProps } from '../../interfaces/PropTypes';

const DropdownButton = styled(Button)`
  && {
    width: 100%;
    height: 55px;
    margin-top: 20px;
    margin-right: 10px;
    text-align: left;
    &:hover {
      background-color: #598dff;
    }
  }
`;

const InfoContainer = styled('div')`
  padding: 10px 0 0 10px;
`;

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

const StyledOptionToggle = styled(ToggleButtonGroup)`
  margin-top: 10px;
  width: 100%;
`;

const StyledOptionButtonToggle = styled(ToggleButton)`
  width: 100%;
  height: 32px;
  margin-bottom: 10px;
`;

const StyledList = styled(List)`
  padding: 0 15px;
`;

const DropdownOption: React.FC<DropdownOptionProps> = ({
  optionName,
  optionState,
  setOptionState,
  optionChoices,
  multiple,
  noOff,
}) => {
  const handleOptionChange = (event: React.MouseEvent<HTMLElement>, newOption: string | null) => {
    if (newOption !== null) {
      setOptionState(newOption);
    }
  };

  return (
    <ListItem key={optionName}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <ListItemText primary={optionName} />
        </Grid>
        <Grid item xs={12}>
          <StyledOptionToggle
            size="small"
            exclusive={multiple ? false : true}
            value={optionState}
            onChange={handleOptionChange}
            aria-label="option choices"
          >
            {!noOff && (
              <StyledOptionButtonToggle value="off" aria-label="default">
                off
              </StyledOptionButtonToggle>
            )}
            {optionChoices.map((option) => (
              <StyledOptionButtonToggle key={option} value={option} aria-label={option}>
                {option}
              </StyledOptionButtonToggle>
            ))}
          </StyledOptionToggle>
        </Grid>
      </Grid>
    </ListItem>
  );
};

const Autotimetabler: React.FC<AutotimetableProps> = ({ handleSelectClass }) => {
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr'];

  const [daysAtUni, setDaysAtUni] = useState<number>(5);
  // const [friendsInClasses, setFriendsInClasses] = useState<string | null>('off');
  const [breaksBetweenClasses, setBreaksBetweenClasses] = useState<number>(0);
  const [days, setDays] = useState<Array<string>>(weekdays);
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 21));
  const [classMode, setClassMode] = useState<string>('hybrid');
  const [isOpenInfo, setIsOpenInfo] = React.useState(false);

  // for opening popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { setAutoVisibility, setAlertMsg } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  const targetActivities = useRef<ClassData[][]>([]);
  const periodsListSerialized = useRef<string[]>([]);

  // caches targetActivities and periodsListSerilized in advance
  useEffect(() => {
    if (!selectedCourses || !selectedCourses.length) return;

    targetActivities.current = selectedCourses
      .map((v) => Object.entries(v.activities).filter(([a, b]) => !a.startsWith('Lecture') && !a.startsWith('Exam')))
      .reduce((a, b) => {
        return a.concat(b);
      })
      .map((a) => a[1])
      .filter((f) => f.some((c) => c.periods.length));

    // [[hasInPerson, hasOnline], ...]
    const hasMode: Array<[boolean, boolean]> = targetActivities.current.map((a) => [
      a.some((v) => v.periods.some((p) => p.locations.length && 'Online' !== p.locations[0])),
      a.some((v) => v.periods.some((p) => p.locations.length && 'Online' === p.locations[0])),
    ]);

    // a list of [all_periods, in_person_periods, online_periods]
    periodsListSerialized.current = [
      JSON.stringify(
        targetActivities.current.map((value) => value.map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end])))
      ),
      JSON.stringify(
        targetActivities.current.map((value, index) =>
          value
            .filter((v) => !hasMode[index][0] || v.periods.some((p) => p.locations.length && 'Online' !== p.locations[0]))
            .map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end]))
        )
      ),
      JSON.stringify(
        targetActivities.current.map((value, index) =>
          value
            .filter((v) => !hasMode[index][1] || v.periods.some((p) => p.locations.length && 'Online' === p.locations[0]))
            .map((c) => c.periods.map((p) => [p.time.day, p.time.start, p.time.end]))
        )
      ),
    ];
  }, [selectedCourses]);

  const toggleIsOpenInfo = () => {
    setIsOpenInfo(!isOpenInfo);
  };

  const open = Boolean(anchorEl);

  const popoverId = open ? 'simple-popover' : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFormat = (newFormats: string[]) => {
    setDays(newFormats);
  };

  const doAuto = async () => {
    const autoParams: Array<string | number> = [
      startTime.getHours(),
      endTime.getHours(),
      days.map((v) => (weekdays.indexOf(v) + 1).toString()).reduce((a, b) => a + b),
      breaksBetweenClasses,
      daysAtUni,
    ];

    const rightLocation = (aClass: ClassData) => {
      // gives online/inperson variant if mode is online/inperson
      return (
        classMode === 'hybrid' ||
        aClass.periods.some((p) => p.locations.length && (classMode === 'online') === ('Online' === p.locations[0]))
      );
    };

    if (!selectedCourses || !selectedCourses.length) return;

    const timetableData: { [k: string]: any } = ['start', 'end', 'days', 'gap', 'maxdays']
      .map((k, index) => [k, autoParams[index]])
      .reduce((o, key) => ({ ...o, [key[0]]: key[1] }), {});

    timetableData['periodsListSerialized'] = periodsListSerialized.current.at(
      ['hybrid', 'in person', 'online'].findIndex((v) => v === classMode)
    );

    try {
      const res = await getAutoTimetable(timetableData);

      setAutoVisibility(true);
      setAlertMsg(res.length ? 'Success!' : 'No timetable found.');

      res.forEach((timeAsNum, index) => {
        const [day, start] = [Math.floor(timeAsNum / 100), (timeAsNum % 100) / 2];
        const k = targetActivities.current[index].find(
          (c) => c.periods.length && c.periods[0].time.day === day && c.periods[0].time.start === start && rightLocation(c)
        );

        if (k !== undefined) {
          handleSelectClass(k);
        }
      });
    } catch (e) {
      if (e instanceof NetworkError) {
        setAutoVisibility(true);
        setAlertMsg("Couldn't get response.");
      }
    }
    setAnchorEl(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleClick}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          AUTO-TIMETABLE
        </Box>
        <Box ml="5px" />
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
                  algorithm to allocate your classes clashlessly based on the courses and constraints you provide, failing when
                  there are no clashless solutions.
                </p>
                <p>
                  If a course lacks an <code>ONLINE</code> offering, its <code>IN PERSON</code> classes may be scheduled instead,
                  and vice-versa. <em>Currently</em>, the autotimetabler won't schedule certain types of classes like Lectures.
                </p>
                <p>Autotimetabler may lack full support for certain courses.</p>
              </Typography>
              <IconButton
                style={{ position: 'absolute', right: 10, top: 10 }}
                aria-label="close"
                onClick={toggleIsOpenInfo}
                size="large"
              >
                <Close />
              </IconButton>
            </DialogContentText>
          </DialogContent>
        </Dialog>
        <StyledList>
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={7} container>
                <ListItemText sx={{ alignSelf: 'center' }} primary="Earliest start time" />
              </Grid>
              <Grid item xs={5}>
                <TimePicker
                  views={['hours']}
                  value={startTime}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(e) => {
                    if (e) setStartTime(e);
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={7} container>
                <ListItemText sx={{ alignSelf: 'center' }} primary="Latest end time" />
              </Grid>
              <Grid item xs={5}>
                <TimePicker
                  views={['hours']}
                  value={endTime}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(e) => {
                    if (e) setEndTime(e);
                  }}
                />
              </Grid>
            </Grid>
          </ListItem>
          <DropdownOption
            optionName="Days"
            optionState={days}
            setOptionState={handleFormat}
            optionChoices={weekdays}
            multiple={true}
            noOff
          />
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Breaks between classes" />
              </Grid>
              <Grid item xs={4}>
                <Slider
                  valueLabelDisplay="auto"
                  valueLabelFormat={(e) => e.toString() + ' hr' + (e === 1 ? '' : 's')}
                  step={1}
                  value={breaksBetweenClasses}
                  onChange={(e, v) => setBreaksBetweenClasses(v as number)}
                  min={0}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Max days of Uni" />
              </Grid>
              <Grid item xs={4}>
                <Slider
                  valueLabelDisplay="auto"
                  step={1}
                  value={daysAtUni}
                  onChange={(e, v) => setDaysAtUni(v as number)}
                  min={1}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>
          <DropdownOption
            optionName="Mode"
            optionState={classMode}
            setOptionState={setClassMode}
            optionChoices={['hybrid', 'in person', 'online']}
            noOff
          />
        </StyledList>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={doAuto}>
          <FlashOn />
          GO
        </ExecuteButton>
      </Popover>
    </div>
  );
};

export default Autotimetabler;
