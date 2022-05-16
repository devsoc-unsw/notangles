import React, { useContext, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { Box, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Popover, TextField, ToggleButton,
  ToggleButtonGroup, } from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { CourseContext } from '../../context/CourseContext';
import { EventData } from '../../interfaces/Course';
import { DropdownOptionProps } from '../../interfaces/PropTypes';

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

  // Function to open popover when Event button is clicked
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //Close popover when Event button is clicked again
  const handleClose = () => {
    setAnchorEl(null);
  };

  const {selectedEvents, setSelectedEvents} = useContext(CourseContext)

  //TimePicker stuff
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 21));

  // Taking in user's input
  const [eventName, setEventName] = useState('');
  const [eventNameError, setEventNameError] = useState(false);

  const [description, setDescription] = useState('');

  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState(false);

  const doCreateEvent = async () => {
    setEventNameError(eventName === '');
    setLocationError(location === '');
    // Close popover when +Create button clicked.
    const newEvent: EventData = {
      name: eventName,
      time: {
        day: 1,
        start: startTime.getHours(),
        end: endTime.getHours(),
      },
      location: location,
      description: description
    }
    setSelectedEvents({
      ...selectedEvents,
      'newkey': newEvent
    })
    setAnchorEl(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Create Event Button */}
      <DropdownButton variant="contained" onClick={handleClick}>
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
                  id="eventName-basic"
                  label="Add Event Name"
                  onChange={(e) => setEventName(e.target.value)}
                  error={eventNameError}
                  variant="outlined"
                  fullWidth
                  required
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
                  id="description-basic"
                  label="Add Description (optional)"
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  multiline
                  fullWidth
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
                  id="location-basic"
                  label="Add Location"
                  onChange={(e) => setLocation(e.target.value)}
                  error={locationError}
                  variant="outlined"
                  fullWidth
                  required
                />
              </ListItem>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2 }} primary="Start time" />

              <Grid item xs={6} sx={{ paddingRight: 2 }}>
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
            <Grid container spacing={0} sx={{ paddingBottom: 2 }}>
              <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2 }} primary="End time" />
              <Grid item xs={6} sx={{ paddingRight: 2 }}>
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
          {/* <DropdownOption /> */}
        </StyledList>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={doCreateEvent}>
          <Add sx={{ alignSelf: 'center' }} />
          CREATE
        </ExecuteButton>
      </Popover>
    </div>
  );
};

export default CustomEvent;
