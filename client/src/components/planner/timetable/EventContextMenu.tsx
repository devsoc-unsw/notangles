import { ContentCopy, ContentPaste, Edit, FileCopy } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem } from '@mui/material';

import { EventCard } from '../../../interfaces/Timetable';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';

interface EventContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number } | null;
  setContextMenu: React.Dispatch<React.SetStateAction<{ mouseX: number; mouseY: number } | null>>;
  event: EventCard;
  eventCopied: boolean;
  setCopiedEvent: React.Dispatch<React.SetStateAction<EventCard | undefined>>;
  handleEditEvent: () => void;
  handlePasteEvent: (
    pasteTime: { day: number; start: number; end: number },
    setContextMenu: React.Dispatch<React.SetStateAction<{ mouseX: number; mouseY: number } | null>>,
  ) => void;
  handleDuplicateEvent: () => void;
  handleDeleteEvent: () => void;
}

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  contextMenu,
  setContextMenu,
  event,
  eventCopied,
  setCopiedEvent,
  handleEditEvent,
  handlePasteEvent,
  handleDuplicateEvent,
  handleDeleteEvent,
}) => {
  return (
    <StyledMenu
      open={contextMenu !== null}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      onClose={() => {
        setContextMenu(null);
      }}
      autoFocus={false}
    >
      <MenuItem onClick={handleEditEvent} disabled={event.eventType !== 'CUSTOM'}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => {
          setCopiedEvent(event);
        }}
      >
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>
      <MenuItem
        disabled={!eventCopied}
        onClick={() => {
          handlePasteEvent(event.time, setContextMenu);
        }}
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
          <RedDeleteIcon fontSize="small" />
        </ListItemIcon>
        <RedListItemText>Delete</RedListItemText>
      </MenuItem>
    </StyledMenu>
  );
};

export default EventContextMenu;
