import { Event, LocationOn, Notes } from '@mui/icons-material';
import { ListItemIcon, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { daysShort } from '../../constants/timetable';
import { CustomEventGeneralProps } from '../../interfaces/PropTypes';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { areValidEventTimes } from '../../utils/eventTimes';
import DropdownOption from '../timetable/DropdownOption';

const CustomEventGeneral: React.FC<CustomEventGeneralProps> = ({
  eventName,
  setEventName,
  description,
  setDescription,
  location,
  setLocation,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  eventDays,
  setEventDays,
  initialStartTime,
  initialEndTime,
  initialDay,
  isInitialStartTime,
  setIsInitialStartTime,
  isInitialEndTime,
  setIsInitialEndTime,
  isInitialDay,
  setIsInitialDay,
}) => {
  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
    setIsInitialDay(false);
  };

  return (
    <>
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
          // Displays time as the time of the grid the user pressed
          // when popover has just been opened
          value={isInitialStartTime ? initialStartTime : startTime}
          onChange={(e) => {
            if (e) setStartTime(e);
            setIsInitialStartTime(false);
          }}
        />
      </StyledListItem>
      <StyledListItem>
        <StyledListItemText primary="End time" />
        <TimePicker
          value={isInitialEndTime ? initialEndTime : endTime}
          label={!areValidEventTimes(startTime, endTime) ? 'End time must be after start' : ''}
          slotProps={{ textField: { color: areValidEventTimes(startTime, endTime) ? 'primary' : 'error' } }}
          onChange={(e) => {
            if (e) setEndTime(e);
            setIsInitialEndTime(false);
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
    </>
  );
};

export default CustomEventGeneral;
