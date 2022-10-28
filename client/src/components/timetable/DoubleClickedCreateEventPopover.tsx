import { useContext, useState } from 'react';
import { Popover } from '@mui/material';
import { ExecuteButton } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { Add } from '@mui/icons-material';
import { areValidEventTimes } from '../../utils/eventTimes';
import { daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { createNewEvent } from '../../utils/createEvent';
import { DoubleClickedCreateEventPopoverProps } from '../../interfaces/PropTypes';
import CustomEventGeneral from '../controls/CustomEventGeneral';
import ColorPicker from '../controls/ColorPicker';

const DoubleClickedCreateEventPopover: React.FC<DoubleClickedCreateEventPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  anchorOrigin,
  transformOrigin,
  initialStartTime,
  initialEndTime,
  initialDay,
  tempEventId,
}) => {
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(initialStartTime);
  const [endTime, setEndTime] = useState<Date>(initialEndTime);
  const [eventDays, setEventDays] = useState<Array<string>>([initialDay]);

  // For the pre-selected fields
  const [isInitialStartTime, setIsInitialStartTime] = useState<boolean>(true);
  const [isInitialEndTime, setIsInitialEndTime] = useState<boolean>(true);
  const [isInitialDay, setIsInitialDay] = useState<boolean>(true);

  const [color, setColor] = useState<string>('#1F7E8C');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const createEvent = (day: string) => {
    setEarliestStartTime(Math.min(Math.floor(earliestStartTime), Math.floor(startTime.getHours() + startTime.getMinutes() / 60)));
    setLatestEndTime(Math.max(Math.ceil(latestEndTime), Math.ceil(endTime.getHours() + endTime.getMinutes() / 60)));

    // Updating the days of the week must be handled here otherwise
    // DroppedCards will not have the updated days and it will crash
    // (which is understandable since it's breaking React best practices by not being purely functional)
    if (daysShort.indexOf(day) == 5) {
      const MondayToSaturday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      setDays((prev: string[]) => (prev.length > MondayToSaturday.length ? [...prev] : MondayToSaturday));
    } else if (daysShort.indexOf(day) == 6) {
      setDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    }

    let startTimeToCreateAs = startTime;
    let endTimeToCreateAs = endTime;

    if (isInitialStartTime) {
      // User did not change start time
      startTimeToCreateAs = initialStartTime;
    }

    if (isInitialEndTime) {
      // User did not change end time
      endTimeToCreateAs = initialEndTime;
    }

    const newEvent = createNewEvent(eventName, location, description, color, day, startTimeToCreateAs, endTimeToCreateAs);
    setCreatedEvents({
      ...createdEvents,
      [newEvent.event.id]: newEvent,
    });
    return newEvent;
  };

  const createEvents = () => {
    if (!areValidEventTimes(startTime, endTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEvents: Record<string, EventPeriod> = {};

    if (isInitialDay) {
      // User did not change day
      const newEvent = createEvent(initialDay);
      newEvents[newEvent.event.id] = newEvent;
      console.log('user did not change day');
    } else {
      // Create an event for each day that is selected in the dropdown option
      for (const day of eventDays) {
        const newEvent = createEvent(day);
        newEvents[newEvent.event.id] = newEvent;
      }
    }

    // Delete the temporary created event with its id
    for (const event in createdEvents) {
      if (event === tempEventId) {
        delete createdEvents[event];
      }
    }

    setCreatedEvents({ ...createdEvents, ...newEvents });
    setEventName('');
    setLocation('');
    setDescription('');
    setEventDays([]);
    setIsInitialDay(true);
    setIsInitialStartTime(true);
    setIsInitialEndTime(true);

    // Close all popovers when Create button is clicked
    onClose();
    setColorPickerAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setIsInitialDay(false);
    setEventDays(newFormats);
  };

  const handleOpenColourPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColourPicker = () => {
    setColorPickerAnchorEl(null);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        onClose();
      }}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
    >
      <StyledList>
        <CustomEventGeneral
          eventName={eventName}
          setEventName={setEventName}
          location={location}
          setLocation={setLocation}
          description={description}
          setDescription={setDescription}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          eventDays={eventDays}
          setEventDays={setEventDays}
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          initialDay={initialDay}
          isInitialStartTime={isInitialStartTime}
          setIsInitialStartTime={setIsInitialStartTime}
          isInitialEndTime={isInitialEndTime}
          setIsInitialEndTime={setIsInitialEndTime}
          isInitialDay={isInitialDay}
          setIsInitialDay={setIsInitialDay}
        />
        <ColorPicker
          color={color}
          setColor={setColor}
          colorPickerAnchorEl={colorPickerAnchorEl}
          handleOpenColourPicker={handleOpenColourPicker}
          handleCloseColourPicker={handleCloseColourPicker}
        />
      </StyledList>
      <ExecuteButton
        variant="contained"
        color="primary"
        disableElevation
        disabled={eventName === '' || location === '' || (eventDays.length === 0 && initialDay === '')}
        onClick={createEvents}
      >
        <Add />
        CREATE
      </ExecuteButton>
    </Popover>
  );
};

export default DoubleClickedCreateEventPopover;
