import React, { useContext, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { CourseContext } from '../../context/CourseContext';
import { EventData } from '../../interfaces/Course';
import { DropdownOptionProps } from '../../interfaces/PropTypes';
import { AppContext } from '../../context/AppContext';
import { ColorPicker, ColorValue } from 'mui-color';
import { v4 as uuidv4 } from 'uuid';

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

const ExecuteButton = styled(Button)`
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
    setDays(newFormats);
  };

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { earliestEventTime, setEarliestEventTime } = useContext(AppContext);
  const { latestEventTime, setLatestEventTime } = useContext(AppContext);
  const { setErrorVisibility, setAlertMsg } = useContext(AppContext);

  //TimePicker stuff
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 10));

  // Taking in user's input
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const [days, setDays] = useState<Array<string>>([]);

  const [color, setColor] = useState<ColorValue>('#1F7E8C');

  const doCreateEvent = () => {
    const uuid = uuidv4();

    if (startTime.getHours() >= endTime.getHours()) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEvent: EventData = {
      id: uuid,
      name: eventName,
      time: {
        day: weekdays.indexOf(days.toString()) + 1,
        start: startTime.getHours() + startTime.getMinutes() / 60,
        end: endTime.getHours() + endTime.getMinutes() / 60,
      },
      location: location,
      description: description,
      color: color,
    };
    console.log(String(weekdays.indexOf(days.toString()) + 1));

    setCreatedEvents({
      ...createdEvents,
      [uuid]: newEvent,
    });

    if (startTime.getHours() < earliestEventTime) {
      setEarliestEventTime(startTime.getHours());
    }

    if (endTime.getHours() > latestEventTime) {
      setLatestEventTime(endTime.getHours());
    }

    setEventName('');
    setLocation('');
    setDescription('');
    setDays([]);

    // Close popover when +Create button clicked.
    setAnchorEl(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Create Event Button */}
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleClick}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          CREATE EVENT
        </Box>
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>

      {/*Code for Popover */}
      {/*Where the popover appears in relation to the button */}
      <Popover
        // id={popoverId}
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
          <ListItem>
            <Grid container spacing={0} sx={{ paddingTop: 2 }}>
              <ListItem>
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
              </ListItem>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItem>
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
              </ListItem>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItem>
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
              </ListItem>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="Start time" />

              <Grid item xs="auto" sx={{ paddingRight: 2 }}>
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
              <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="End time" />
              <Grid item xs="auto" sx={{ paddingRight: 2 }}>
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
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <DropdownOption optionName="Days" optionState={days} setOptionState={handleFormat} optionChoices={weekdays} noOff />
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="Color" />
              <Grid item xs="auto" sx={{ paddingRight: 2 }}>
                <ColorPicker defaultValue="" onChange={(e) => setColor(e)} value={color} />
              </Grid>
            </Grid>
          </ListItem>
        </StyledList>
        <ExecuteButton
          variant="contained"
          color="primary"
          disableElevation
          disabled={eventName === '' || location === '' || days.length === 0}
          onClick={doCreateEvent}
        >
          <Add sx={{ alignSelf: 'center' }} />
          CREATE
        </ExecuteButton>
      </Popover>
    </div>
  );
};

export default CustomEvent;
