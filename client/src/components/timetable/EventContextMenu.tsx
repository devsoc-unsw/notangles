import React, { useContext, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { createEventObj } from '../../utils/createEvent';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { daysShort } from '../../constants/timetable';

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  eventPeriod,
  contextMenu,
  setContextMenu,
  setPopupOpen,
  setIsEditing,
  setCopiedEvent,
  copiedEvent,
}) => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  // Creates a new event object that is a copy of the event with eventId
  const getNewEvent = () => {
    if (eventPeriod != undefined) {
      const newEvent = createEventObj(
        eventPeriod.event.name,
        eventPeriod.event.location,
        eventPeriod.event.description,
        eventPeriod.event.color,
        eventPeriod.time.day - 1,
        eventPeriod.time.start,
        eventPeriod.time.end
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
    setCopiedEvent(newEvent);
  };

  const handlePasteEvent = () => {
    if (!copiedEvent) return;

    const newEvent = createEventObj(
      copiedEvent.event.name,
      copiedEvent.event.location,
      copiedEvent.event.description,
      copiedEvent.event.color,
      copiedEvent.time.day + 1,
      eventPeriod.time.start,
      eventPeriod.time.end
    );
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  return (
    <Menu
      open={contextMenu != null}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      onClose={() => setContextMenu(null)}
      autoFocus={false}
    >
      <MenuItem onClick={handleDuplicateEvent}>Duplicate</MenuItem>
      <MenuItem onClick={handleDeleteEvent}>Delete</MenuItem>
      <MenuItem onClick={handleEditEvent}>Edit</MenuItem>
      <MenuItem onClick={handleCopyEvent}>Copy</MenuItem>
      <MenuItem disabled={copiedEvent === null} onClick={handlePasteEvent}>
        Paste
      </MenuItem>
    </Menu>
  );
};

export default EventContextMenu;
