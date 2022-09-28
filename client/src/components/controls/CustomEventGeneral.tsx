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
}) => {
  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
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
    </>
  );
};

export default CustomEventGeneral;
