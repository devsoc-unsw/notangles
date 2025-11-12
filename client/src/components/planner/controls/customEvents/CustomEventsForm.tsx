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

const initialStartTime = createDateWithTime(9);
const initialEndTime = createDateWithTime(10);
const initialDay = '';
const daysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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
  const [courseCode, setCourseCode] = useState<string>('');
  const [classCode, setClassCode] = useState<string>('');
  const [classesCodes, setClassesCodes] = useState<Record<string, string>[]>([]);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);
  const [isInitialStartTime, setIsInitialStartTime] = useState<boolean>(false);
  const [isInitialEndTime, setIsInitialEndTime] = useState<boolean>(false);
  const [isInitialDay, setIsInitialDay] = useState<boolean>(false);

  const handleCreateEvent = () => {
    // eventCreateMutation.mutate({ timetableId, event: {

    // });
    handlePopoverClose();
  };

  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
    setIsInitialDay(false);
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

        {/* <ColorPicker
            color={color}
            setColor={setColor}
            colorPickerAnchorEl={colorPickerAnchorEl}
            handleOpenColorPicker={handleOpenColorPicker}
            handleCloseColorPicker={handleCloseColorPicker}
          /> */}
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
