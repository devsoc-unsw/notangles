import React, { useContext, useEffect, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { TabContext, TabList } from '@mui/lab';
import { Box, Popover, Tab } from '@mui/material';
import getCourseInfo from '../../api/getCourseInfo';
import { daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { CoursesList } from '../../interfaces/Courses';
import { ClassData, EventPeriod } from '../../interfaces/Periods';
import { StyledControlsButton } from '../../styles/ControlStyles';
import { DropdownButton, ExecuteButton, StyledTabPanel } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { createNewEvent } from '../../utils/createEvent';
import { areValidEventTimes, createDateWithTime } from '../../utils/eventTimes';
import ColorPicker from './ColorPicker';
import CustomEventGeneral from './CustomEventGeneral';
import CustomEventTutoring from './CustomEventTutoring';
import CustomEventInvite from './CustomEventInvite';

const CustomEvent: React.FC = () => {
  // Which element to make the popover stick to
  const [createEventAnchorEl, setCreateEventAnchorEl] = useState<HTMLDivElement | HTMLButtonElement | null>(null);
  // Whether the popover is shown
  const openCreateEventPopover = Boolean(createEventAnchorEl);

  const [eventType, setEventType] = useState<string>('General');
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
  const [eventDays, setEventDays] = useState<Array<string>>([]);
  const [courseCode, setCourseCode] = useState<string>('');
  const [classCode, setClassCode] = useState<string>('');
  const [classesList, setClassesList] = useState<ClassData[]>([]);
  const [classesCodes, setClassesCodes] = useState<Record<string, string>[]>([]);
  const [link, setLink] = useState<string>('');
  const [color, setColor] = useState<string>('#1F7E8C');

  // NO pre-selected fields when event popover is opened from controls bar
  const [isInitialStartTime, setIsInitialStartTime] = useState<boolean>(false);
  const [isInitialEndTime, setIsInitialEndTime] = useState<boolean>(false);
  const [isInitialDay, setIsInitialDay] = useState<boolean>(false);

  const { year, term, isConvertToLocalTimezone, coursesList } = useContext(AppContext);

  /**
   * Process coursesList to get an array of course codes
   * @param coursesList
   * @returns an array of course codes
   */
  const getCoursesCodes = (coursesList: CoursesList) => {
    const coursesCodes: Array<Record<string, string>> = [];
    coursesList.forEach((course, idx) => {
      coursesCodes.push({ id: idx.toString(), label: course.code });
    });
    return coursesCodes;
  };

  let coursesCodes = getCoursesCodes(coursesList);
  // Remove duplicated UG/PG course codes
  coursesCodes = coursesCodes.filter((course, idx) => coursesCodes.findIndex((c) => c.label === course.label) === idx);

  // Get the list of classes for the selected course code.
  useEffect(() => {
    const tutoringActivities = ['Tutorial', 'Laboratory', 'Tutorial-Laboratory', 'Workshop'];
    if (courseCode !== '') {
      getCourseInfo(year, term, courseCode, isConvertToLocalTimezone)
        .catch((err) => {
          return err;
        })
        .then((course) => {
          Object.keys(course.activities).forEach((activity) => {
            if (tutoringActivities.includes(activity)) {
              classesList.push(...course.activities[activity]);
              setClassesList(classesList);
              course.activities[activity].forEach((classData: ClassData, idx: number) => {
                classesCodes.push({ id: idx.toString(), label: classData.section });
              });
            }
          });
          setClassesCodes(classesCodes);
        });
    }
  }, [courseCode]);

  const popoverId = openCreateEventPopover ? 'simple-popover' : undefined;

  // Which element to make the colour picker popover stick to
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateEventAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setEventType('General');

    // Reset info about the general event
    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);
    setStartTime(createDateWithTime(9));
    setEndTime(createDateWithTime(10));
    setColor('#1F7E8C');

    // Reset info about the tutoring event
    setCourseCode('');
    setClassCode('');
    setClassesCodes([]);
    setClassesList([]);

    // Reset info about the invite event
    setLink('');

    // Close the popovers
    setColorPickerAnchorEl(null);
    setCreateEventAnchorEl(null);
  };

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const createEvents = () => {
    const newEvents: Record<string, EventPeriod> = {};

    if (eventType === 'General') {
      if (!areValidEventTimes(startTime, endTime)) {
        setAlertMsg('End time is earlier than start time');
        setErrorVisibility(true);
        return;
      }

      // Create an event for each day that is selected in the dropdown option
      for (const day of eventDays) {
        const newEvent = createEvent(eventName, location, description, color, day, startTime, endTime);
        newEvents[newEvent.event.id] = newEvent;
      }
    } else if (eventType === 'Tutoring') {
      // Get the class details according to the chosen class code.
      const classDetails = classesList.find((classData) => classData.section === classCode);
      // Create an event for each period of the selected class.
      classDetails!.periods.forEach((period) => {
        const newEvent = createEvent(
          classDetails!.courseCode + ' ' + period.subActivity,
          period.locations[0],
          classCode,
          color,
          daysShort[period.time.day - 1],
          createDateWithTime(period.time.start),
          createDateWithTime(period.time.end)
        );
        newEvents[newEvent.event.id] = newEvent;
      });
    } else {
      const encoded =
        'eyJ0eXBlIjoiZXZlbnQiLCJldmVudCI6eyJpZCI6ImJiZjgyNDgyLTUxYmQtNDI4YS04YTY4LTk2MThmYTdlZGUyYiIsIm5hbWUiOiJUaXRsZSIsImxvY2F0aW9uIjoibG9jYXRpb24iLCJkZXNjcmlwdGlvbiI6IiIsImNvbG9yIjoiIzFGN0U4QyJ9LCJ0aW1lIjp7ImRheSI6MSwic3RhcnQiOjksImVuZCI6MTB9fQ==';
      console.log(atob(encoded));
      const inviteEvent = JSON.parse(atob(encoded));
      // const { invName, invLocation, invDescription, invColor } = inviteEvent.event;
      // const { invDay, invStart, invEnd } = inviteEvent.time;
      console.log(inviteEvent);
      const newEvent = createEvent(
        inviteEvent.event.name,
        inviteEvent.event.location,
        inviteEvent.event.description,
        inviteEvent.event.color,
        'Mo',
        inviteEvent.time.start,
        inviteEvent.time.end
      );
      console.log(newEvent);
      newEvents[newEvent.event.id] = newEvent;
    }

    setEventType('General');

    // Reset info about the general event
    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);
    setStartTime(createDateWithTime(9));
    setEndTime(createDateWithTime(10));

    // Reset info about the tutoring event
    setCourseCode('');
    setClassCode('');
    setClassesList([]);
    setClassesCodes([]);

    // Reset info about the invite event
    setLink('');

    // Close the popover
    setColorPickerAnchorEl(null);
    setCreateEventAnchorEl(null);
    setCreatedEvents({ ...createdEvents, ...newEvents });
    handleClose();
  };

  const createEvent = (
    eventName: string,
    location: string,
    description: string,
    color: string,
    day: string,
    startTime: Date,
    endTime: Date
  ) => {
    const newEvent = createNewEvent(eventName, location, description, color, day, startTime, endTime);

    setCreatedEvents({
      ...createdEvents,
      [newEvent.event.id]: newEvent,
    });

    setEarliestStartTime(Math.min(Math.floor(earliestStartTime), Math.floor(startTime.getHours() + startTime.getMinutes() / 60)));
    setLatestEndTime(Math.max(Math.ceil(latestEndTime), Math.ceil(endTime.getHours() + endTime.getMinutes() / 60)));

    // Updating the days of the week must be handled here otherwise
    // DroppedCards will not have the updated days and it will crash
    // (which is understandable since it's breaking React best practices by not being purely functional)
    if (daysShort.indexOf(day) == 5) {
      const MondayToSaturday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      setDays((prev: string[]) => (prev.length > MondayToSaturday.length ? [...prev] : MondayToSaturday));
    } else if (daysShort.indexOf(day) == 6) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    }

    return newEvent;
  };

  return (
    <StyledControlsButton>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleOpen}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          CREATE EVENT
        </Box>
        {openCreateEventPopover ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
      <Popover
        id={popoverId}
        open={openCreateEventPopover}
        anchorEl={createEventAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <StyledList>
          <TabContext value={eventType}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(_, newEventType) => setEventType(newEventType)}>
                <Tab label="General" value="General" />
                <Tab label="Tutoring" value="Tutoring" />
                <Tab label="Add Invite" value="Add Invite" />
              </TabList>
            </Box>
            <StyledTabPanel value="General">
              <CustomEventGeneral
                eventName={eventName}
                setEventName={setEventName}
                location={location}
                setLocation={setLocation}
                description={description}
                setDescription={setDescription}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                eventDays={eventDays}
                setEventDays={setEventDays}
                initialStartTime={createDateWithTime(9)}
                initialEndTime={createDateWithTime(10)}
                initialDay={''}
                isInitialStartTime={isInitialStartTime}
                setIsInitialStartTime={setIsInitialStartTime}
                isInitialEndTime={isInitialEndTime}
                setIsInitialEndTime={setIsInitialEndTime}
                isInitialDay={isInitialDay}
                setIsInitialDay={setIsInitialDay}
              />
            </StyledTabPanel>
            <StyledTabPanel value="Tutoring">
              <CustomEventTutoring
                coursesCodes={coursesCodes}
                classesCodes={classesCodes}
                setCourseCode={setCourseCode}
                setClassCode={setClassCode}
              />
            </StyledTabPanel>
            <StyledTabPanel value="Add Invite">
              <CustomEventInvite link={link} setLink={setLink} />
            </StyledTabPanel>
          </TabContext>
          {eventType !== 'Add Invite' && (
            <ColorPicker
              color={color}
              setColor={setColor}
              colorPickerAnchorEl={colorPickerAnchorEl}
              handleOpenColorPicker={handleOpenColorPicker}
              handleCloseColorPicker={handleCloseColorPicker}
            />
          )}
        </StyledList>
        <ExecuteButton
          variant="contained"
          color="primary"
          disableElevation
          disabled={
            (eventType === 'General' && (eventName === '' || location === '' || eventDays.length === 0)) ||
            (eventType === 'Tutoring' && (courseCode === '' || classCode === '')) ||
            (eventType === 'Add Invite' && link === '')
          }
          onClick={createEvents}
        >
          <Add />
          CREATE
        </ExecuteButton>
      </Popover>
    </StyledControlsButton>
  );
};

export default CustomEvent;
