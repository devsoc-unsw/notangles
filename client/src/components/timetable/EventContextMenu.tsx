import React, { useContext, useEffect, useRef, useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { createNewEvent } from '../../utils/createEvent';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { registerCard, unregisterCard } from '../../utils/Drag';

const EventContextMenu: React.FC<EventContextMenuProps> = ({ eventId, eventPeriod, contextMenu, setContextMenu, setPopupOpen, setIsEditing }) => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const handleDuplicateEvent = () => {
    const DaysOfWeek: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const event = Object.values(createdEvents).find(e => e.event.id === eventId);
    
    if (event != undefined) {
      const eventStart = new Date(0);
      eventStart.setHours(event.time.start);
      eventStart.setMinutes((event.time.start % 1) * 60);

      const eventEnd = new Date(0);
      eventEnd.setHours(event.time.end);
      eventEnd.setMinutes((event.time.end % 1) * 60);

      // Create new event
      const newEvent = createNewEvent(
        event.event.name, 
        event.event.location, 
        event.event.description, 
        event.event.color, 
        DaysOfWeek[event.time.day - 1], 
        eventStart, 
        eventEnd
      );

      setCreatedEvents({...createdEvents, [newEvent.event.id]: newEvent});
      }

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

  return (
    <Menu 
        open={contextMenu != null}
        anchorReference='anchorPosition'
        anchorPosition={
        contextMenu !== null
        ? { top: contextMenu.y, left: contextMenu.x }
        : undefined
        }
        onClose={() => setContextMenu(null)}
    >
        <MenuItem onClick={handleDuplicateEvent}>Duplicate</MenuItem>
        <MenuItem onClick={handleDeleteEvent}>Delete</MenuItem>
        <MenuItem onClick={handleEditEvent}>Edit</MenuItem>
    </Menu>
  );
};

export default EventContextMenu;
