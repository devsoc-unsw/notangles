import { Event, LocationOn, Notes } from '@mui/icons-material';
import { ListItemIcon, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { useAddTimetableEvent } from '../../../../api/timetable/mutations';
import { StyledListItem } from '../../../../styles/ControlStyles';
import { StyledListItemText } from '../../../../styles/CustomEventStyles';
import { areValidEventTimes, createDateWithTime } from '../../../../utils/eventHelpers';
import DropdownOption from '../../timetable/DropdownOption';

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface CustomEventsCustomFormProps {
  timetableId: string;
  color: string;
  setCustomEventFormSatisfied: (satisfied: boolean) => void;
}

const CustomEventsCustomForm = forwardRef(
  ({ timetableId, color, setCustomEventFormSatisfied }: CustomEventsCustomFormProps, ref) => {
    const eventCreateMutation = useAddTimetableEvent();

    const [eventName, setEventName] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [eventLocation, setEventLocation] = useState<string>('');
    const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
    const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
    const [eventDays, setEventDays] = useState<string[]>([]);

    useEffect(() => {
      setCustomEventFormSatisfied(!!eventName && eventDays.length > 0);
    }, [eventName, eventDays, setCustomEventFormSatisfied]);

    const handleCreateEvent = useCallback(
      (onSuccess: () => void) => {
        for (const day of eventDays) {
          const startMins = startTime.getHours() * 60 + startTime.getMinutes();
          const endMins = endTime.getHours() * 60 + endTime.getMinutes();
          const isMidnight = endMins === 0;
          eventCreateMutation.mutate(
            {
              event: {
                timetableId,
                colour: color,
                dayOfWeek: DAYS_SHORT.indexOf(day),
                start: startMins,
                end: isMidnight ? 24 * 60 : endMins,
                type: 'CUSTOM',
                title: eventName,
                description: eventDescription,
                location: eventLocation,
              },
            },
            { onSuccess },
          );
        }
      },
      [eventDays, startTime, endTime, timetableId, color, eventName, eventDescription, eventLocation, eventCreateMutation],
    );
    useImperativeHandle(ref, () => ({
      handleCreateEvent,
    }), [handleCreateEvent]);

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
            value={eventName}
            onChange={(e) => {
              setEventName(e.target.value);
            }}
            variant="outlined"
            fullWidth
            required
          />
        </StyledListItem>
        <StyledListItem>
          <ListItemIcon>
            <Notes />
          </ListItemIcon>
          <TextField
            id="outlined-basic"
            label="Description (optional)"
            value={eventDescription}
            onChange={(e) => {
              setEventDescription(e.target.value);
            }}
            variant="outlined"
            multiline
            fullWidth
          />
        </StyledListItem>
        <StyledListItem>
          <ListItemIcon>
            <LocationOn />
          </ListItemIcon>
          <TextField
            id="outlined-basic"
            label="Location (optional)"
            value={eventLocation}
            onChange={(e) => {
              setEventLocation(e.target.value);
            }}
            variant="outlined"
            fullWidth
          />
        </StyledListItem>
        <StyledListItem>
          <StyledListItemText primary="Start time" />
          <TimePicker
            // Displays time as the time of the grid the user pressed
            // when popover has just been opened
            value={startTime}
            onChange={(e) => {
              if (e) setStartTime(e);
            }}
          />
        </StyledListItem>
        <StyledListItem>
          <StyledListItemText primary="End time" />
          <TimePicker
            value={endTime}
            label={!areValidEventTimes(startTime, endTime) ? 'End time must be after start' : ''}
            slotProps={{ textField: { color: areValidEventTimes(startTime, endTime) ? 'primary' : 'error' } }}
            onChange={(e) => {
              if (e) setEndTime(e);
            }}
          />
        </StyledListItem>
        <DropdownOption
          optionName="Days"
          optionState={eventDays}
          setOptionState={handleFormat}
          optionChoices={DAYS_SHORT}
          multiple={true}
          noOff
        />
      </>
    );
  },
);

CustomEventsCustomForm.displayName = 'CustomEventsCustomForm';
export default CustomEventsCustomForm;
