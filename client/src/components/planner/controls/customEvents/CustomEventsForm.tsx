import { Add, Event, LocationOn, Notes } from '@mui/icons-material';
import { TabContext } from '@mui/lab';
import { Box, ListItemIcon, Tab, Tabs, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useAddTimetableEvent } from '../../../../api/timetable/mutations';
import { StyledListItem } from '../../../../styles/ControlStyles';
import { ExecuteButton, StyledList, StyledListItemText, StyledTabPanel } from '../../../../styles/CustomEventStyles';
import { areValidEventTimes, createDateWithTime } from '../../../../utils/eventHelpers';
import DropdownOption from '../../timetable/DropdownOption';
import ColorPicker from '../ColorPicker';

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface CustomEventsPopoverProps {
  handlePopoverClose: () => void;
  timetableId: string;
}

const CustomEventsPopover = ({ handlePopoverClose, timetableId }: CustomEventsPopoverProps) => {
  const queryClient = useQueryClient();
  const eventCreateMutation = useAddTimetableEvent(queryClient);

  const [eventType, setEventType] = useState<string>('General');
  const [eventName, setEventName] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
  const [eventDays, setEventDays] = useState<string[]>([]);

  const [color, setColor] = useState<string>('default-1');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);

  const [courseCode, setCourseCode] = useState<string>('');
  const [classCode, setClassCode] = useState<string>('');
  // const [classesCodes, setClassesCodes] = useState<Record<string, string>[]>([]);

  const handleCreateEvent = () => {
    for (const day of eventDays) {
      const isMidnight = endTime.getHours() + endTime.getMinutes() / 60 === 0;
      eventCreateMutation.mutate({
        event: {
          timetableId,
          colour: color,
          dayOfWeek: DAYS_SHORT.indexOf(day),
          start: startTime.getHours() + startTime.getMinutes() / 60,
          end: isMidnight ? 24.0 : endTime.getHours() + endTime.getMinutes() / 60,
          type: eventType === 'General' ? 'CUSTOM' : 'TUTORING',
          title: eventName,
          description: eventDescription,
          location: eventLocation,
        },
      });
    }
    handlePopoverClose();
  };

  const handleFormat = (newFormats: string[]) => {
    console.log(newFormats);
    setEventDays(newFormats);
  };

  const handleTabChange = (_: React.SyntheticEvent, newEventType: string) => {
    setEventType(newEventType);
  };

  const isEventButtonDisabled = useMemo(() => {
    return (
      (eventType === 'General' && (!eventName || eventDays.length === 0)) ||
      (eventType === 'Tutoring' && (!courseCode || !classCode))
    );
  }, [eventType, eventDays, courseCode, classCode, eventName]);

  return (
    <>
      <StyledList>
        <TabContext value={eventType}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs onChange={handleTabChange} value={eventType} variant="fullWidth">
              <Tab label="General" value="General" />
              <Tab label="Tutoring" value="Tutoring" />
            </Tabs>
          </Box>
          <StyledTabPanel value="General">
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
          </StyledTabPanel>
          <StyledTabPanel value="Tutoring">
            {/* <CustomEventTutoring
                coursesCodes={coursesCodes}
                classesCodes={classesCodes}
                setCourseCode={setCourseCode}
                setClassCode={setClassCode}
              /> */}
          </StyledTabPanel>
        </TabContext>

        <ColorPicker
          color={color}
          setColor={setColor}
          colorPickerAnchorEl={colorPickerAnchorEl}
          handleOpenColorPicker={(e) => {
            setColorPickerAnchorEl(e.currentTarget);
          }}
          handleCloseColorPicker={() => {
            setColorPickerAnchorEl(null);
          }}
        />
      </StyledList>
      <ExecuteButton
        variant="contained"
        color="primary"
        disableElevation
        disabled={isEventButtonDisabled}
        onClick={handleCreateEvent}
      >
        <Add />
        Create
      </ExecuteButton>
    </>
  );
};

export default CustomEventsPopover;
