import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, Edit, Event, LocationOn, Notes, Save } from '@mui/icons-material';
import { Dialog } from '@mui/material';
import { daysShort } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Periods';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { useEventDrag } from '../../utils/Drag';
import { createDateWithTime } from '../../utils/eventTimes';
import DiscardDialog from './DiscardDialog';
import DroppedEventDialog from './DroppedEventDialog';
import EditEventDialog from './EditEventDialog';

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventPeriod, popupOpen, handleClose, isEditing, setIsEditing }) => {
  const { name, location, description, color } = eventPeriod.event;
  const { day, start, end } = eventPeriod.time;

  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>(name);
  const [newDays, setNewDays] = useState<Array<string>>([daysShort[day - 1]]);
  const [newStartTime, setNewStartTime] = useState<Date>(createDateWithTime(start));
  const [newEndTime, setNewEndTime] = useState<Date>(createDateWithTime(end));
  const [newLocation, setNewLocation] = useState<string>(location);
  const [newDescription, setNewDescription] = useState<string>(description);

  const [newColor, setNewColor] = useState<string>(color as string);

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const updateEventTime = (eventTime: EventTime, id: string) => {
    setCreatedEvents({
      ...createdEvents,
      [id]: {
        ...createdEvents[id],
        time: { ...eventTime },
      },
    });

    // Update the time that appears in the TimePicker boxes when in edit mode.
    setNewDays([daysShort[eventTime.day - 1]]);

    setNewStartTime(createDateWithTime(eventTime.start));
    setNewEndTime(createDateWithTime(eventTime.end));
  };

  useEventDrag(updateEventTime);

  const handleDiscardChanges = () => {
    handleClose();
    setOpenSaveDialog(false);
    setIsEditing(false);
    setNewName(name);
    setNewLocation(location);
    setNewDescription(description);
    setNewDays([daysShort[day - 1]]);
    setNewColor(color.toString());
    setNewStartTime(createDateWithTime(start));
    setNewEndTime(createDateWithTime(end));
  };

  const handleCloseDialog = () => {
    if (isEditing && isChanged) {
      // Open a dialog to alert user that changes have not been saved when in isEditing mode
      setOpenSaveDialog(true);
    } else {
      handleClose();
    }

    setIsEditing(false);
    setIsChanged(false);
  };

  return (
    <Dialog open={popupOpen} maxWidth="sm" onClose={handleCloseDialog}>
      {isEditing ? (
        <EditEventDialog 
          eventPeriod={eventPeriod} 
          handleCloseDialog={handleCloseDialog} 
          setIsEditing={setIsEditing} 
          isChanged={isChanged} 
          setIsChanged={setIsChanged} 
        />
      ) : (
        <>
          <DiscardDialog
            openSaveDialog={openSaveDialog}
            handleDiscardChanges={handleDiscardChanges}
            setIsEditing={setIsEditing}
            setOpenSaveDialog={setOpenSaveDialog}
          />
          <DroppedEventDialog 
            eventPeriod={eventPeriod} 
            handleCloseDialog={handleCloseDialog} 
            setIsEditing={setIsEditing} 
            isEditing={isEditing} 
          />
        </>
      )}
    </Dialog>
  );
};

export default ExpandedEventView;
