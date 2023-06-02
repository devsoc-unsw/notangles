import React, { useContext } from 'react';
import { StyledMenu } from '../../styles/CustomEventStyles';
import { MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { FileCopy, Edit, Delete, ContentCopy, ContentPaste } from '@mui/icons-material';
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

  const createNewEventObject = (): EventPeriod => {
    const { id, name, location, description, color, day, start, end }: EventMetadata = {
      ...eventPeriod.event,
      ...eventPeriod.time,
    };
    return createEventObj(name, location, description, color, day, start, end);
  };
  const handleDuplicateEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createNewEventObject();
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
    const newEvent = createNewEventObject();
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
            <Edit fontSize="small"/>
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleCopyEvent}>
        <ListItemIcon>
            <ContentCopy fontSize="small"/>
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>
      <MenuItem
        disabled={copiedEvent === null}
        onClick={() => handlePasteEvent(copiedEvent, setContextMenu, createdEvents, setCreatedEvents)}>
        <ListItemIcon>
            <ContentPaste fontSize="small"/>
        </ListItemIcon>
        <ListItemText>Paste</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDuplicateEvent}>
        <ListItemIcon>
            <FileCopy fontSize="small"/>
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
