import { useState } from 'react';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { StyledListItem, StyledListItemText } from '../styles/CustomEventStyles';
import { StyledList } from '../styles/DroppedCardStyles';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { areValidEventTimes, createDateWithTime } from './eventTimes';
import { TimePicker } from '@mui/x-date-pickers';
import DropdownOption from '../components/timetable/DropdownOption';
import { daysShort } from '../constants/timetable';
import { ColourIndicatorBox, StyledButtonContainer } from '../styles/ControlStyles';
import { Colorful } from '@uiw/react-color';

const CreateEventPopover: React.FC = () => {
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
  const [eventDays, setEventDays] = useState<Array<string>>([]);
  const [color, setColor] = useState<string>('#1F7E8C');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
  };

  const handleOpenColourPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColourPicker = () => {
    setColorPickerAnchorEl(null);
  };

  return (
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
              <TextField {...params} error={params.error || tooEarly} label={tooEarly && 'End time must be after start time'} />
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
  );
};

export default CreateEventPopover;
