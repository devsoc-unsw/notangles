import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import getAutoTimetable from '../../api/getAutoTimetable';
import { unknownErrorMessage, weekdaysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import NetworkError from '../../interfaces/NetworkError';
import { ClassData, PeriodInfo } from '../../interfaces/Periods';
import { AutotimetableProps } from '../../interfaces/PropTypes';
import { StyledButtonText, StyledControlsButton } from '../../styles/ControlStyles';
import { DropdownButton } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { createDateWithTime } from '../../utils/eventTimes';
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

const Autotimetabler: React.FC<AutotimetableProps> = ({ handleSelectClass }) => {
  const [daysAtUni, setDaysAtUni] = useState<number>(5);
  // const [friendsInClasses, setFriendsInClasses] = useState<string | null>('off');
  const [breaksBetweenClasses, setBreaksBetweenClasses] = useState<number>(0);
  const [days, setDays] = useState<Array<string>>(weekdaysShort);
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(21));
  const [classMode, setClassMode] = useState<ClassMode>('hybrid');
  const [isOpenInfo, setIsOpenInfo] = useState(false);

  // Which element to make the popover stick to
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // Whether the popover is shown
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  const { setAutoVisibility, setAlertMsg, setErrorVisibility } = useContext(AppContext);
  const { selectedCourses, createdEvents } = useContext(CourseContext);

  const targetActivities = useRef<ClassData[][]>([]);
  const periodInfoPerMode = useRef<Record<ClassMode, PeriodInfo[]>>({ hybrid: [], 'in person': [], online: [] });

  useEffect(() => {
    if (!selectedCourses || !selectedCourses.length) return;

    targetActivities.current = selectedCourses
      .map((v) =>
        Object.entries(v.activities).filter(
          ([activity, classes]) => !activity.startsWith('Lecture') && !activity.startsWith('Exam')
        )
      )
      .reduce((a, b) => a.concat(b))
      .map(([activity, classes]) => classes)
      .filter((classes) => classes.some((c) => c.periods.length))
      .map((classes) => classes.filter((c) => c.periods.length));

    const hasMode: Array<[boolean, boolean]> = targetActivities.current.map((a) => [
      a.some((v) => v.periods.some((p) => p.locations.length && 'Online' !== p.locations[0])),
      a.some((v) => v.periods.some((p) => p.locations.length && 'Online' === p.locations[0])),
    ]);

    periodInfoPerMode.current = {
      hybrid: targetActivities.current.map(
        (value) =>
          ({
            periodsPerClass: value.at(0)?.periods.length ?? 0,
            periodTimes: value
              .map((c) => c.periods.map((p) => [p.time.day, p.time.start]).reduce((p1, p2) => p1.concat(p2), []))
              .reduce((a, b) => a.concat(b), []), // extracts the period's day and start time for all periods of a class for all classes of an activity (classData[]) and then reduces that list of list of lists into a single list
            durations: value.at(0)?.periods.map((p) => p.time.end - p.time.start) ?? [],
          } as PeriodInfo)
      ),
      'in person': targetActivities.current.map(
        (value, index) =>
          ({
            periodsPerClass: value.at(0)?.periods.length ?? 0,
            periodTimes: value
              .filter((v) => !hasMode[index][1] || v.periods.some((p) => p.locations.length && 'Online' !== p.locations[0]))
              .map((c) => c.periods.map((p) => [p.time.day, p.time.start]).reduce((p1, p2) => p1.concat(p2), []))
              .reduce((a, b) => a.concat(b), []),
            durations: value.at(0)?.periods.map((p) => p.time.end - p.time.start) ?? [],
          } as PeriodInfo)
      ),
      online: targetActivities.current.map(
        (value, index) =>
          ({
            periodsPerClass: value.at(0)?.periods.length ?? 0,
            periodTimes: value
              .filter((v) => !hasMode[index][1] || v.periods.some((p) => p.locations.length && 'Online' === p.locations[0]))
              .map((c) => c.periods.map((p) => [p.time.day, p.time.start]).reduce((p1, p2) => p1.concat(p2), []))
              .reduce((a, b) => a.concat(b), []),
            durations: value.at(0)?.periods.map((p) => p.time.end - p.time.start) ?? [],
          } as PeriodInfo)
      ),
    };
  }, [selectedCourses]);

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

  /**
   *
   * @param classData The class
   * @returns Whether the class has periods offered in the current teaching mode
   */
  const rightLocation = (classData: ClassData) => {
    return (
      classMode === 'hybrid' ||
      classData.periods.some((p) => p.locations.length && (classMode === 'online') === ('Online' === p.locations[0]))
    );
  };

  const doAuto = async () => {
    if (!selectedCourses || !selectedCourses.length) return;

    const selectedDays = days.map((v) => (weekdaysShort.indexOf(v) + 1).toString());
    const selectedDaysStr = selectedDays.length ? selectedDays.reduce((a, b) => a + b) : '12345';

    const autoParams: Array<string | number> = [
      startTime.getHours(),
      endTime.getHours(),
      selectedDaysStr,
      breaksBetweenClasses,
      daysAtUni,
    ];

    const timetableData: { [k: string]: any } = ['start', 'end', 'days', 'gap', 'maxdays']
      .map((k, index) => [k, autoParams[index]])
      .reduce((o, key) => ({ ...o, [key[0]]: key[1] }), {});

    // We treat events as single-period classes with a sole time slot
    timetableData['periodInfoList'] = [
      ...periodInfoPerMode.current[`${classMode}`],
      ...Object.values(createdEvents).map(
        (eventPeriod) =>
          ({
            periodsPerClass: 1,
            periodTimes: [eventPeriod.time.day, eventPeriod.time.start],
            durations: [eventPeriod.time.end - eventPeriod.time.start],
          } as PeriodInfo)
      ),
    ];

    try {
      const [resultsWithEvents, isOptimal] = await getAutoTimetable(timetableData);
      const results = resultsWithEvents.slice(0, targetActivities.current.length);

      setAutoVisibility(true);
      setAlertMsg(results.length ? (isOptimal ? 'Success!' : 'Could not satisfy perfectly') : 'No timetable found');

      results.forEach((timeAsNum, index) => {
        const [day, start] = [Math.floor(timeAsNum / 100), (timeAsNum % 100) / 2];

        // Find each class specified by the autotimetabler and update the timetable
        const allocatedClass = targetActivities.current[index].find(
          (c) => c.periods.length && c.periods[0].time.day === day && c.periods[0].time.start === start && rightLocation(c)
        );

        if (allocatedClass !== undefined) handleSelectClass(allocatedClass);
      });
    } catch (e) {
      if (e instanceof NetworkError) {
        setAutoVisibility(true);
        setAlertMsg("Couldn't get response");
      } else {
        setErrorVisibility(true);
        setAlertMsg(unknownErrorMessage);
      }
    }

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
                  algorithm to allocate your classes clashlessly based on the courses and constraints you provide, failing when
                  there are no clashless solutions.
                </p>
                <p>
                  If a course lacks an <code>ONLINE</code> offering, its <code>IN PERSON</code> classes may be scheduled instead,
                  and vice-versa. <em>Currently</em>, the autotimetabler won't schedule certain types of classes like Lectures.
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
              <Grid item xs={7} container>
                <StyledDatePickerLabel primary="Earliest start time" />
              </Grid>
              <Grid item xs={5}>
                <TimePicker
                  views={['hours']}
                  value={startTime}
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
                <StyledDatePickerLabel primary="Latest end time" />
              </Grid>
              <Grid item xs={5}>
                <TimePicker
                  views={['hours']}
                  value={endTime}
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
            optionChoices={weekdaysShort}
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
    </StyledControlsButton>
  );
};

export default Autotimetabler;
