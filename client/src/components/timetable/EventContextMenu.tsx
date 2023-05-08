import React, { useContext, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { createNewEvent } from '../../utils/createEvent';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { daysShort } from '../../constants/timetable';

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  eventPeriod,
  contextMenu,
  setContextMenu,
  setPopupOpen,
  setIsEditing,
  setCopiedEvent,
}) => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const getEventTime = (hour: number) => {
    const eventTime = new Date(0);
    eventTime.setHours(hour);
    eventTime.setMinutes((hour % 1) * 60);
    return eventTime;
  };

  // Creates a new event object that is a copy of the event with eventId
  const getNewEvent = () => {
    if (eventPeriod != undefined) {
      const eventStart = getEventTime(eventPeriod.time.start);
      const eventEnd = getEventTime(eventPeriod.time.end);
      const newEvent = createNewEvent(
        eventPeriod.event.name,
        eventPeriod.event.location,
        eventPeriod.event.description,
        eventPeriod.event.color,
        daysShort[eventPeriod.time.day - 1],
        eventStart,
        eventEnd
      );
      return newEvent;
    }

    return null;
  };

  const handleDuplicateEvent = () => {
    const newEvent = getNewEvent();
    if (newEvent !== null) setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  const handleDeleteEvent = () => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[eventPeriod.event.id];
    setCreatedEvents(updatedEventData);
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setPopupOpen(true);
    setContextMenu(null);
  };

  const handleCopyEvent = () => {
    setContextMenu(null);
    const newEvent = getNewEvent();
    console.log(newEvent);
    setCopiedEvent(newEvent);
  };

  return (
    <Menu
      open={contextMenu != null}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      onClose={() => setContextMenu(null)}
    >
      <MenuItem onClick={handleDuplicateEvent}>Duplicate</MenuItem>
      <MenuItem onClick={handleDeleteEvent}>Delete</MenuItem>
      <MenuItem onClick={handleEditEvent}>Edit</MenuItem>
      <MenuItem onClick={handleCopyEvent}>Copy</MenuItem>
    </Menu>
  );
};

export default EventContextMenu;
