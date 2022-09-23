import React, { useContext, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { Colorful } from '@uiw/react-color';
import { daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { ColourIndicatorBox, StyledButtonContainer, StyledControlsButton } from '../../styles/ControlStyles';
import { ExecuteButton, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { createNewEvent } from '../../utils/createEvent';
import { areValidEventTimes, createDateWithTime } from '../../utils/eventTimes';
import DropdownOption from '../timetable/DropdownOption';

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

const CustomEvent: React.FC = () => {
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
  const [eventDays, setEventDays] = useState<Array<string>>([]);
  const [color, setColor] = useState<string>('#1F7E8C');

  // Which element to make the popover stick to
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // Whether the popover is shown
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  // Which element to make the colour picker popover stick to
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  // Whether the colour picker popover is shown
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // Reset all values in the popover
    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);
    setStartTime(createDateWithTime(9));
    setEndTime(createDateWithTime(10));
    setColor('#1F7E8C');
    setAnchorEl(null);
    setColorPickerAnchorEl(null);
    setAnchorEl(null);
  };

  const handleOpenColourPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColourPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
  };

  const createEvents = () => {
    if (!areValidEventTimes(startTime, endTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEvents: Record<string, EventPeriod> = {};

    // Create an event for each day that is selected in the dropdown option
    for (const day of eventDays) {
      const newEvent = createEvent(day);
      newEvents[newEvent.event.id] = newEvent;
    }
    setCreatedEvents({ ...createdEvents, ...newEvents });
    // Close all popovers and reset values when Create button is clicked
    handleClose();
  };

  const createEvent = (day: string) => {
    const newEvent = createNewEvent(eventName, location, description, color, day, startTime, endTime)

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
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
      <Popover
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
        <StyledList>
          <StyledListItem>
            <ListItemIcon>
              <Event />
            </ListItemIcon>
            <TextField
              id="outlined-required"
              label="Event Name"
              onChange={(e) => setEventName(e.target.value)}
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
              value={startTime}
              renderInput={(params) => <TextField {...params} />}
              onChange={(e) => {
                if (e) setStartTime(e);
              }}
            />
          </StyledListItem>
          <StyledListItem>
            <StyledListItemText primary="End time" />
            <TimePicker
              value={endTime}
              renderInput={(params) => {
                const tooEarly = !areValidEventTimes(startTime, endTime);
                return (
                  <TextField
                    {...params}
                    error={params.error || tooEarly}
                    label={tooEarly && 'End time must be after start time'}
                  />
                );
              }}
              onChange={(e) => {
                if (e) setEndTime(e);
              }}
            />
          </StyledListItem>
          <DropdownOption
            optionName="Days"
            optionState={eventDays}
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
          disabled={eventName === '' || location === '' || eventDays.length === 0}
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
