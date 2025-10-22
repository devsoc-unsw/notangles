import { Close, Edit, EditNote, FileCopy, Save, Star } from '@mui/icons-material';
import {
  Button,
  Dialog,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { Term } from '../../../api/times/times';
import {
  useDeleteTimetable,
  useDuplicateTimetable,
  useMakePrimaryTimetable,
  useRenameTimetable,
} from '../../../api/timetable/mutations';
import { useTimetableIdsQuery, useTimetableInfoQueries, useTimetableInfoQuery } from '../../../api/timetable/queries';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';
import { ExecuteButton, RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { StyledSnackbar } from '../../../styles/TimetableTabStyles';
import StyledDialog from '../../StyledDialog';

const TIMETABLE_LIMIT = 13;

interface TimetableTabContextMenuProps {
  anchorElement: null | { x: number; y: number };
  setAnchorElement: (anchorElement: null | { x: number; y: number }) => void;
  selectedTimetableId: string;
  selectTimetableId: (id: string) => void;
  term: Term;
}

const TimetableTabContextMenu = ({
  anchorElement,
  setAnchorElement,
  selectedTimetableId,
  selectTimetableId,
  term,
}: TimetableTabContextMenuProps) => {
  const isMacOS = navigator.userAgent.includes('Mac');
  const deleteTimetabletip = isMacOS ? 'Delete Tab (Cmd+Shift+x)' : 'Delete Tab (Ctrl+Shift+x)';

  const queryClient = useQueryClient();
  const { name, primary } = useTimetableInfoQuery(selectedTimetableId);
  const timetableIds = useTimetableIdsQuery(term);
  const timetables = useTimetableInfoQueries(timetableIds);
  const deleteTimetable = useDeleteTimetable(queryClient);
  const renameTimetable = useRenameTimetable(queryClient);
  const duplicateTimetable = useDuplicateTimetable(queryClient);
  const setPrimaryTimetable = useMakePrimaryTimetable(queryClient);

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<string>('');
  const [renamedHelper, setRenamedHelper] = useState<string>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [openRestoreAlert, setOpenRestoreAlert] = useState<boolean>(false);

  const primaryTimetableId = timetables.find((t) => t.primary)?.id;

  // Hotkey to confirm delete prompt by pressing enter button
  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (deleteOpen && event.key === 'Enter') {
        event.preventDefault();
        deleteConfirm?.focus();
        deleteConfirm?.click();
      }
    };

    document.addEventListener('keydown', handleDeleteEnterShortcut);

    return () => {
      document.removeEventListener('keydown', handleDeleteEnterShortcut);
    };
  }, [deleteOpen]);

  // Action button for the restore deleted timetable snackbar
  const restoreTimetable = (
    <>
      <Button
        sx={{ color: '#3a76f8', fontSize: 'small' }}
        onClick={() => {
          setOpenRestoreAlert(false);
        }}
      >
        Undo
      </Button>
      <IconButton aria-label="close" color="inherit" sx={{ color: '#3a76f8' }}>
        <Close fontSize="small" />
      </IconButton>
    </>
  );

  // Handle changes to deleting a timetable
  const handleDeleteTimetable = () => {
    const currentIndex = timetableIds.indexOf(selectedTimetableId);
    const newIndex = currentIndex === 0 ? 0 : currentIndex - 1;
    selectTimetableId(timetableIds[newIndex]);
    deleteTimetable.mutate({
      timetableId: selectedTimetableId,
      onSuccess: () => {
        setOpenRestoreAlert(true);
        handleMenuClose();
      },
    });
  };

  // Handler to duplicate the selected timetable
  const handleDuplicateTimetable = () => {
    // TODO: Handle error case where exceeds timetable limit (on BE)
    duplicateTimetable.mutate({
      timetableId: selectedTimetableId,
      onSuccess: (id: string) => {
        selectTimetableId(id);
      },
    });
    handleMenuClose();
  };

  // Handle changes to the rename text field
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const str = e.target.value;
    setRenamedString(str);
    setRenamedHelper(`${String(str.length)}/30`);
    setRenamedErr(str.length > 30);
  };

  const handleRenameOpen = () => {
    setRenamedString(name);
    setRenamedHelper(`${String(name.length)}/30`);
    setRenamedErr(name.length > 30);
    setRenameOpen(true);
  };

  // Collapse all modals and menus
  const handleMenuClose = useCallback(() => {
    setRenameOpen(false);
    setDeleteOpen(false);
    setAnchorElement(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StyledMenu
        open={anchorElement !== null}
        anchorReference="anchorPosition"
        anchorPosition={anchorElement !== null ? { top: anchorElement.y, left: anchorElement.x } : undefined}
        onClose={handleMenuClose}
        autoFocus={false}
      >
        <Tooltip title={primary ? 'This timetable is already primary' : ''}>
          <MenuItem
            onClick={() => {
              if (primaryTimetableId === undefined) return;

              setPrimaryTimetable.mutate({
                timetableId: selectedTimetableId,
                currentPrimaryTimetableId: primaryTimetableId,
              });
              handleMenuClose();
            }}
            sx={{ opacity: primary ? 0.5 : 1 }}
          >
            <ListItemIcon>
              <Star fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set as primary</ListItemText>
          </MenuItem>
        </Tooltip>
        <MenuItem onClick={handleRenameOpen}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateTimetable}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip title={deleteTimetabletip}>
          <MenuItem
            onClick={() => {
              setDeleteOpen(true);
            }}
          >
            <ListItemIcon>
              <RedDeleteIcon fontSize="small" />
            </ListItemIcon>
            <RedListItemText>Delete</RedListItemText>
          </MenuItem>
        </Tooltip>
      </StyledMenu>

      {/* Rename timetable Dialog  */}
      <Dialog open={renameOpen} maxWidth="sm" onClose={handleMenuClose}>
        <StyledTopIcons>
          <IconButton aria-label="close">
            <Close />
          </IconButton>
        </StyledTopIcons>
        <StyledDialogTitle>
          <StyledTitleContainer>Rename Timetable</StyledTitleContainer>
        </StyledDialogTitle>
        <StyledDialogContent>
          <ListItem>
            <ListItemIcon sx={{ paddingBottom: 2 }}>
              <EditNote />
            </ListItemIcon>
            <TextField
              fullWidth={true}
              id="outlined-required"
              required
              variant="outlined"
              helperText={renamedHelper}
              value={renamedString}
              error={renamedErr}
              onChange={handleRenameChange}
            />
          </ListItem>
        </StyledDialogContent>

        <ExecuteButton
          variant="contained"
          color="primary"
          id="confirm-rename-button"
          disableElevation
          disabled={renamedString === '' || renamedErr}
          onClick={() => {
            renameTimetable.mutate({ timetableId: selectedTimetableId, newName: renamedString });
            handleMenuClose();
          }}
        >
          <Save />
          SAVE
        </ExecuteButton>
      </Dialog>

      {/* Delete timetable Dialog  */}
      <StyledDialog
        open={deleteOpen}
        title="Confirm Deletion"
        content="Are you sure you want to delete this current timetable?"
        confirmButtonText="Delete"
        confirmButtonId="confirm-delete-button"
        onClose={handleMenuClose}
        onConfirm={handleDeleteTimetable}
      />
      {/* Restore deleted timetable Alert */}
      <StyledSnackbar
        open={openRestoreAlert}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => {
          setOpenRestoreAlert(false);
        }}
        message="Timetable Deleted"
        action={restoreTimetable}
      />
    </>
  );
};

export default TimetableTabContextMenu;
