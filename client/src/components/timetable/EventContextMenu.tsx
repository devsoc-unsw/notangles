import { ContentCopy, ContentPaste, Edit, FileCopy } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import React, { useContext } from 'react';

import { CourseContext } from '../../context/CourseContext';
import { UserContext } from '../../context/UserContext';
import { EventMetadata } from '../../interfaces/Periods';
import { EventContextMenuProps } from '../../interfaces/PropTypes';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../styles/CustomEventStyles';
import { handleDeleteEvent, handlePasteEvent } from '../../utils/cardsContextMenu';
import { createEventObj } from '../../utils/createEvent';

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  eventPeriod,
  contextMenu,
  setContextMenu,
  setPopupOpen,
  setIsEditing,
}) => {
  const { createdEvents, setCreatedEvents, copiedEvent, setCopiedEvent } = useContext(CourseContext);
  const { groupsSidebarCollapsed } = useContext(UserContext);

  const { name, location, description, color, day, start, end }: EventMetadata = {
    ...eventPeriod.event,
    ...eventPeriod.time,
  };

  const handleDuplicateEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createEventObj(name, location, description, color, day, start, end, eventPeriod.subtype);
    setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
    setContextMenu(null);
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setPopupOpen(true);
    setContextMenu(null);
  };

  const handleCopyEvent = () => {
    if (eventPeriod === undefined) return;
    const newEvent = createEventObj(name, location, description, color, day, start, end, eventPeriod.subtype);
    setCopiedEvent(newEvent);
    setContextMenu(null);
  };

  return (
    <StyledMenu
      open={contextMenu !== null && groupsSidebarCollapsed}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      onClose={() => setContextMenu(null)}
      autoFocus={false}
    >
      <MenuItem onClick={handleEditEvent} disabled={eventPeriod.subtype === 'Tutoring'}>
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
      <MenuItem onClick={() => handleDeleteEvent(createdEvents, setCreatedEvents, eventPeriod)}>
        <ListItemIcon>
          <RedDeleteIcon fontSize="small" />
        </ListItemIcon>
        <RedListItemText>Delete</RedListItemText>
      </MenuItem>
    </StyledMenu>
  );
};

export default EventContextMenu;
