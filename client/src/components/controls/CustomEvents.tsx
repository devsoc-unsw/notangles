import React, { useContext, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { ColorPicker, ColorValue } from 'mui-color';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { StyledList, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
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
  margin-top: 16px;
  height: 40px;
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

const CustomEvent = ({}) => {
  // for opening popover

  //anchorEL sets position of the popover, useState to see if popover should show or not
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  //if trye, the popover is shown, currently set to the same as anchorEL
  const open = Boolean(anchorEl);

  const popoverId = open ? 'simple-popover' : undefined;

  // Function to open popover when Event button is clicked
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //Close popover when Event button is clicked again
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setEventDAys(newFormats);
  };

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setDays } = useContext(AppContext);
  const { setErrorVisibility, setAlertMsg, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  // Time picker stuff
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 10));

  // Taking in user's input
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const [eventDays, setEventDAys] = useState<Array<string>>([]);

  const [color, setColor] = useState<ColorValue>('#1F7E8C');

  const doCreateEvent = () => {
    const uuid = uuidv4();

    if (startTime.getHours() >= endTime.getHours()) {
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
        day: weekdays.indexOf(eventDays.toString()) + 1,
        start: startTime.getHours() + startTime.getMinutes() / 60,
        end: endTime.getHours() + endTime.getMinutes() / 60,
      },
    };

    setCreatedEvents({
      ...createdEvents,
      [uuid]: newEvent,
    });

    if (startTime.getHours() < earliestStartTime) {
      setEarliestStartTime(startTime.getHours());
    }

    if (endTime.getHours() > latestEndTime) {
      setLatestEndTime(endTime.getHours());
    }

    // this updating must be handled here otherwise DroppedCards will not have the updated days and it will crash (which is understandable since it's breaking react best practices by not being purely functional)
    if (weekdays.indexOf(eventDays.toString()) == 5) {
      const MondayToSaturday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      setDays((prev: string[]) => (prev.length > MondayToSaturday.length ? [...prev] : MondayToSaturday));
    } else if (weekdays.indexOf(eventDays.toString()) == 6) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    }

    setEventName('');
    setLocation('');
    setDescription('');
    setEventDAys([]);

    // Close popover when +Create button clicked.
    setAnchorEl(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleClick}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          CREATE EVENT
        </Box>
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>

      {/* Where the popover appears in relation to the button */}
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
                return <TextField {...params} error={params.error || tooEarly} label={tooEarly ? 'before start time' : ''} />;
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
            optionChoices={weekdays}
            noOff
          />
          <ListItem>
            <StyledListItemText primary="Color" />
            <ColorPicker defaultValue="" onChange={(e) => setColor(e)} value={color} />
          </ListItem>
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
    </div>
  );
};

export default CustomEvent;
