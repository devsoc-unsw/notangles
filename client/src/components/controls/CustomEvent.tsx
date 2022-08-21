import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { Colorful } from '@uiw/react-color';
import React, { useContext, useState } from 'react';
import { start } from 'repl';
import { v4 as uuidv4 } from 'uuid';
import { daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { ColourIndicatorBox, StyledButtonContainer, StyledControlsButton } from '../../styles/ControlStyles';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { areValidEventTimes } from '../../utils/areValidEventTimes';
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

const ExecuteButton = styled(Button)`
  margin-top: 4px;
  height: 40px;
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

const CustomEvent: React.FC = () => {
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 10));
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

  const doCreateEvent = () => {
    const uuid = uuidv4();

    if (!areValidEventTimes(startTime, endTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEvent: EventPeriod = {
      type: 'event',
      event: {
        id: uuid,
        name: eventName,
        location: location,
        description: description,
        color: color,
      },
      time: {
        day: daysShort.indexOf(eventDays.toString()) + 1,
        start: startTime.getHours() + startTime.getMinutes() / 60,
        end: endTime.getHours() + endTime.getMinutes() / 60,
      },
    };

    setCreatedEvents({
      ...createdEvents,
      [uuid]: newEvent,
    });

    setEarliestStartTime(Math.min(earliestStartTime, startTime.getHours()));
    setLatestEndTime(Math.max(latestEndTime, endTime.getHours()));

    // Updating the days of the week must be handled here otherwise
    // DroppedCards will not have the updated days and it will crash
    // (which is understandable since it's breaking React best practices by not being purely functional)
    if (daysShort.indexOf(eventDays.toString()) == 5) {
      const MondayToSaturday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      setDays((prev: string[]) => (prev.length > MondayToSaturday.length ? [...prev] : MondayToSaturday));
    } else if (daysShort.indexOf(eventDays.toString()) == 6) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    }

    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);

    // Close all popovers when Create button is clicked
    setAnchorEl(null);
    setColorPickerAnchorEl(null);
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
              label="Add Event Name"
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
              label="Add Description (optional)"
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
              label="Add Location"
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
              views={['hours']}
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
              views={['hours']}
              value={endTime}
              renderInput={(params) => {
                const tooEarly = startTime.getHours() >= endTime.getHours();
                return (
                  <TextField
                    {...params}
                    error={params.error || tooEarly}
                    label={tooEarly ? 'End time must be after start time' : ''}
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
          onClick={doCreateEvent}
        >
          <Add />
          CREATE
        </ExecuteButton>
      </Popover>
    </StyledControlsButton>
  );
};

export default CustomEvent;
