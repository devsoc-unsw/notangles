import { useContext, useState } from 'react';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { ExecuteButton, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { Add, Event, LocationOn, Notes } from '@mui/icons-material';
import { areValidEventTimes, createDateWithTime } from '../../utils/eventTimes';
import { TimePicker } from '@mui/x-date-pickers';
import DropdownOption from './DropdownOption';
import { daysShort } from '../../constants/timetable';
import { ColourIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';
import { Colorful } from '@uiw/react-color';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { createNewEvent } from '../../utils/createEvent';
import { CreateEventPopoverProps } from '../../interfaces/PropTypes';

const CreateEventPopover: React.FC<CreateEventPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  anchorOrigin,
  transformOrigin,
  isDoubleClicked,
  initialStartTime,
  initialEndTime,
  initialDay,
}) => {
  const [isInitialDay, setIsInitialDay] = useState<boolean>(isDoubleClicked);
  const [isInitialStartTime, setIsInitialStartTime] = useState<boolean>(isDoubleClicked);
  const [isInitialEndTime, setIsInitialEndTime] = useState<boolean>(isDoubleClicked);
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(initialStartTime);
  const [endTime, setEndTime] = useState<Date>(initialEndTime);
  const [eventDays, setEventDays] = useState<Array<string>>(isInitialDay ? [initialDay] : []);
  const [color, setColor] = useState<string>('#1F7E8C');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const createEvent = (day: string) => {
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

    let startTimeToCreateAs = startTime;
    let endTimeToCreateAs = endTime;

    if (isInitialStartTime) {
      // This fixes the slow updating of the value passed in (from useRef in TimetableLayout)

      startTimeToCreateAs = initialStartTime;
    }

    if (isInitialEndTime) {
      // This fixes the slow updating of the value passed in (from useRef in TimetableLayout)
      endTimeToCreateAs = initialEndTime;
    }

    const newEvent = createNewEvent(eventName, location, description, color, day, startTimeToCreateAs, endTimeToCreateAs);
    setCreatedEvents({
      ...createdEvents,
      [newEvent.event.id]: newEvent,
    });
    return newEvent;
  };

  const createEvents = () => {
    if (!areValidEventTimes(startTime, endTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEvents: Record<string, EventPeriod> = {};

    // For when there is a pre-selected day
    // (when user double clicks to create event)

    // newEvents[newEvent.event.id] = newEvent;

    if (isInitialDay) {
      // TODO: problem because this doesnt allow user to create cloned events when double clicked
      const newEvent = createEvent(initialDay);
      setEventDays([initialDay]);
      newEvents[newEvent.event.id] = newEvent;
    } else {
      // Create an event for each day that is selected in the dropdown option
      for (const day of eventDays) {
        const newEvent = createEvent(day);
        newEvents[newEvent.event.id] = newEvent;
      }
    }

    // If user double clicked to open popover, delete the temp event
    // the position of that event is just replaced with the new event
    // if (isDoubleClicked) {
    //   console.log('user created event from double click');
    // }

    setCreatedEvents({ ...createdEvents, ...newEvents });
    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);
    setIsInitialDay(true);
    setIsInitialStartTime(true);
    setIsInitialEndTime(true);
    // Close all popovers when Create button is clicked
    onClose();
    setColorPickerAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setIsInitialDay(false);
    setEventDays(newFormats);
  };

  const handleOpenColourPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColourPicker = () => {
    setColorPickerAnchorEl(null);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        onClose();
      }}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
    >
      <StyledList>
        <StyledListItem>
          <ListItemIcon>
            <Event />
          </ListItemIcon>
          <TextField
            id="outlined-required"
            label="Event Name"
            onChange={(e) => {
              setEventName(e.target.value);
            }}
            variant="outlined"
            fullWidth
            required
            defaultValue={eventName}
          />
        </StyledListItem>
        <StyledListItem>
          <ListItemIcon>
            <Notes />
          </ListItemIcon>
          <TextField
            id="outlined-basic"
            label="Description (optional)"
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            multiline
            fullWidth
            defaultValue={description}
          />
        </StyledListItem>
        <StyledListItem>
          <ListItemIcon>
            <LocationOn />
          </ListItemIcon>
          <TextField
            id="outlined-required"
            label="Location"
            onChange={(e) => setLocation(e.target.value)}
            variant="outlined"
            fullWidth
            required
            defaultValue={location}
          />
        </StyledListItem>
        <StyledListItem>
          <StyledListItemText primary="Start time" />
          <TimePicker
            // Displays time as the time of the grid the user pressed
            // when popover has just been opened
            value={isInitialStartTime ? initialStartTime : startTime}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e) => {
              if (e) setStartTime(e);
              setIsInitialStartTime(false);
              setEndTime(initialEndTime);
            }}
          />
        </StyledListItem>
        <StyledListItem>
          <StyledListItemText primary="End time" />
          <TimePicker
            value={isInitialEndTime ? initialEndTime : endTime}
            renderInput={(params) => {
              const tooEarly = !areValidEventTimes(startTime, endTime);
              return (
                <TextField {...params} error={params.error || tooEarly} label={tooEarly && 'End time must be after start time'} />
              );
            }}
            onChange={(e) => {
              if (e) setEndTime(e);
              setIsInitialEndTime(false);
              setStartTime(initialStartTime);
            }}
          />
        </StyledListItem>
        <DropdownOption
          optionName="Days"
          optionState={isInitialDay ? [initialDay] : eventDays}
          setOptionState={handleFormat}
          optionChoices={daysShort}
          multiple={true}
          noOff
        />
        <Box m={1} display="flex" justifyContent="center" alignItems="center">
          <ColourIndicatorBox backgroundColour={color} />
          <StyledButtonContainer>
            <Button
              disableElevation
              variant="contained"
              size="small"
              aria-describedby={colorPickerPopoverId}
              onClick={handleOpenColourPicker}
            >
              Choose Colour
            </Button>
          </StyledButtonContainer>
          <Popover
            open={openColorPickerPopover}
            anchorEl={colorPickerAnchorEl}
            onClose={handleCloseColourPicker}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <ListItem alignItems="flex-start">
              <Colorful onChange={(e) => setColor(e.hex)} color={color} />
            </ListItem>
            <ListItem alignItems="flex-start">
              <TextField
                id="outlined-required"
                label="Hex"
                variant="outlined"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
              />
            </ListItem>
          </Popover>
        </Box>
      </StyledList>
      <ExecuteButton
        variant="contained"
        color="primary"
        disableElevation
        disabled={eventName === '' || location === '' || (eventDays.length === 0 && initialDay === '')}
        onClick={createEvents}
      >
        <Add />
        CREATE
      </ExecuteButton>
    </Popover>
  );
};

export default CreateEventPopover;
