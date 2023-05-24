import React, { useContext } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { createEventObj } from '../../utils/createEvent';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { handlePasteEvent } from '../../utils/cardsContextMenu';
import { EventPeriod, EventMetadata } from '../../interfaces/Periods';

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
  const { id, name, location, description, color, day, start, end }: EventMetadata = {
    ...eventPeriod.event,
    ...eventPeriod.time,
  };
  const createNewEventObject = (): EventPeriod => createEventObj(name, location, description, color, day, start, end);

  const handleDuplicateEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createNewEventObject();
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  const handleDeleteEvent = () => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[id];
    setCreatedEvents(updatedEventData);
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setPopupOpen(true);
    setContextMenu(null);
  };

  const handleCopyEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createNewEventObject();
    setCopiedEvent(newEvent);
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
      <MenuItem
        disabled={copiedEvent === null}
        onClick={() => handlePasteEvent(copiedEvent, setContextMenu, createdEvents, setCreatedEvents)}
      >
        Paste
      </MenuItem>
    </Menu>
  );
};

export default EventContextMenu;
