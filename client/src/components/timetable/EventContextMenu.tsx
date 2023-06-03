import React, { useContext } from 'react';
import { FileCopy, Edit, Delete, ContentCopy, ContentPaste } from '@mui/icons-material';
import { MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod, EventMetadata } from '../../interfaces/Periods';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { StyledMenu } from '../../styles/CustomEventStyles';
import { handlePasteEvent } from '../../utils/cardsContextMenu';
import { createEventObj } from '../../utils/createEvent';

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

  const { name, location, description, color, day, start, end }: EventMetadata = {
    ...eventPeriod.event,
    ...eventPeriod.time,
  };

  const handleDuplicateEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createEventObj(name, location, description, color, day, start, end);
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
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
    if (eventPeriod === undefined) return;
    const newEvent = createEventObj(name, location, description, color, day, start, end);
    setCopiedEvent(newEvent);
    setContextMenu(null);
  };

  return (
    <StyledMenu
      open={contextMenu != null}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      onClose={() => setContextMenu(null)}
      autoFocus={false}
    >
      <MenuItem onClick={handleEditEvent}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleCopyEvent}>
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>
      <MenuItem
        disabled={copiedEvent === null}
        onClick={() => handlePasteEvent(copiedEvent, setContextMenu, createdEvents, setCreatedEvents)}
      >
        <ListItemIcon>
          <ContentPaste fontSize="small" />
        </ListItemIcon>
        <ListItemText>Paste</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDuplicateEvent}>
        <ListItemIcon>
          <FileCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Duplicate</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleDeleteEvent}>
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </StyledMenu>
  );
};

export default EventContextMenu;
