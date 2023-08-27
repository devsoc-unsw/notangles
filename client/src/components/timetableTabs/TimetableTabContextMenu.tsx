import {
  Button,
  Dialog,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListItem,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import storage from '../../utils/storage';
import { ContentCopy, Edit, Delete, Save, Close, EditNote } from '@mui/icons-material';
import { ExecuteButton, StyledMenu } from '../../styles/CustomEventStyles';
import { TimetableData, CourseData, SelectedClasses, CreatedEvents } from '../../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';
import { TimetableTabContextMenuProps } from '../../interfaces/PropTypes';
import {
  StyledDialogButtons,
  StyledDialogContent,
  StyledDialogTitle,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../styles/ControlStyles';
import { StyledSnackbar } from '../../styles/TimetableTabStyles';
import { duplicateClasses, duplicateEvents } from '../../utils/timetableHelpers';

const TimetableTabContextMenu: React.FC<TimetableTabContextMenuProps> = ({ anchorElement, setAnchorElement }) => {
  const TIMETABLE_LIMIT = 13;

  const {
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setAlertFunction,
    alertFunction,
    setErrorVisibility,
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, assignedColors, setAssignedColors } = useContext(CourseContext);

  const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

  let deleteTimetabletip = isMacOS ? 'Delete Tab (Cmd+Delete)' : 'Delete Tab (Ctrl+Backspace)';

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<string>('');
  const [renamedHelper, setRenamedHelper] = useState<string>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [openRestoreAlert, setOpenRestoreAlert] = useState<boolean>(false);
  let prevTimetables: { selected: number; timetables: TimetableData[] } = { selected: 0, timetables: [] };

  // Helper function to set the timetable state
  const setTimetableState = (
    selectedCourses: CourseData[],
    selectedClasses: SelectedClasses,
    createdEvents: CreatedEvents,
    assignedColors: Record<string, string>,
    timetableIndex: number
  ) => {
    setSelectedCourses(selectedCourses);
    setSelectedClasses(selectedClasses);
    setCreatedEvents(createdEvents);
    setAssignedColors(assignedColors);
    setSelectedTimetable(timetableIndex);
  };

  /**
   * Timetable handlers
   */
  // Handler for deleting a timetable
  const handleDeleteTimetable = (targetIndex: number) => {
    // If only one tab then prevent the delete
    if (displayTimetables.length > 1) {
      prevTimetables = {
        selected: selectedTimetable,
        timetables: displayTimetables.map((timetable: TimetableData) => {
          return {
            name: timetable.name,
            id: timetable.id,
            selectedCourses: timetable.selectedCourses,
            selectedClasses: duplicateClasses(timetable.selectedClasses),
            createdEvents: timetable.createdEvents,
            assignedColors: timetable.assignedColors,
          };
        }),
      };

      // Deleting the current tab will remain on the same index unless it is the last tab
      let newIndex = targetIndex;
      if (newIndex === displayTimetables.length - 1) {
        newIndex = targetIndex - 1;
      }

      const newTimetables = displayTimetables.filter((timetable: TimetableData, index: number) => index !== targetIndex);
      // Updating the timetables state to the new timetable index
      setDisplayTimetables(newTimetables);
      const { selectedCourses, selectedClasses, createdEvents } = newTimetables[newIndex];
      setTimetableState(selectedCourses, selectedClasses, createdEvents, assignedColors, newIndex);

      setOpenRestoreAlert(true);

      // If user chooses to undo the deletion then we will restore the previous state
      setAlertFunction(() => () => {
        setDisplayTimetables(prevTimetables.timetables);
        const { selectedCourses, selectedClasses, createdEvents } = prevTimetables.timetables[prevTimetables.selected];
        setTimetableState(selectedCourses, selectedClasses, createdEvents, assignedColors, prevTimetables.selected);
        return;
      });
    } else {
      setAlertMsg('Must have at least 1 timetable');
      setErrorVisibility(true);
    }
  };

  // Collapse all modals and menus
  const handleMenuClose = () => {
    setRenameOpen(false);
    setDeleteOpen(false);
    setAnchorElement(null);
  };

  const handleRenameOpen = () => {
    let timetableName = displayTimetables[selectedTimetable].name;
    setRenamedString(timetableName);
    setRenamedHelper(`${timetableName.length}/30`);
    timetableName.length > 30 ? setRenamedErr(true) : setRenamedErr(false);
    setRenameOpen(true);
  };

  // Handle closing the rename dialog
  const handleRenameClose = (clickedOk: boolean) => {
    // Checks if the user clicked out of the dialog or submitted a new name
    if (!clickedOk) {
      setRenameOpen(false);
      return;
    }

    if (renamedErr) return;

    // updating the timetable name in the state and local storage
    let newTimetables = [...displayTimetables];
    newTimetables[selectedTimetable].name = renamedString;

    storage.set('timetables', [...newTimetables]);
    setDisplayTimetables([...newTimetables]);

    setRenameOpen(false);
  };

  // Handle changes to the rename text field
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let str = e.target.value;
    setRenamedString(str);
    setRenamedHelper(`${str.length}/30`);
    str.length > 30 ? setRenamedErr(true) : setRenamedErr(false);
  };

  // Handler to duplicate the selected timetable
  const handleDuplicateTimetable = () => {
    // Limiting users to have a maximum of 13 timetables
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const currentTimetable = displayTimetables[selectedTimetable];

      // Creating the duplicated timetable
      const newTimetable = {
        name: currentTimetable.name + ' - Copy',
        id: uuidv4(),
        selectedClasses: duplicateClasses(currentTimetable.selectedClasses),
        selectedCourses: currentTimetable.selectedCourses,
        createdEvents: duplicateEvents(currentTimetable.createdEvents),
        assignedColors: currentTimetable.assignedColors
      };

      // Inserting the duplicate timetable after the current one
      const newTimetables = [
        ...displayTimetables.slice(0, selectedTimetable + 1),
        newTimetable,
        ...displayTimetables.slice(selectedTimetable + 1),
      ];

      // Update the state variables
      storage.set('timetables', newTimetables);
      setDisplayTimetables(newTimetables);
      const { selectedCourses, selectedClasses, createdEvents } = newTimetable;
      setTimetableState(selectedCourses, selectedClasses, createdEvents, assignedColors, selectedTimetable + 1);
      handleMenuClose();
    }
  };

  /**
   * Menu shortcut (hotkey) event listeners
   */
  // Hotkey for creating new timetables
  useEffect(() => {
    const handleCreateTimetableShortcut = (event: KeyboardEvent) => {
      const createButton = document.getElementById('create-timetables-button');

      // Ctrl+Enter on Windows or Cmd+Enter on Mac creates new timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        // Preventing creating a timetable when the delete or rename popups are open
        if (event.key === 'Enter' && !deleteOpen && !renameOpen) {
          event.preventDefault();
          createButton?.focus();
          createButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleCreateTimetableShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleCreateTimetableShortcut);
    };
  }, [deleteOpen, renameOpen]);

  // Hotkey for deleting timetables
  useEffect(() => {
    const handleDeletePopupShortcut = (event: KeyboardEvent) => {
      // Ctrl+Backspace on Windows or Cmd+Delete on Mac deletes the selected timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        // Preventing deletion of timetable when the rename popup is open
        if (event.key === 'Backspace' && !renameOpen) {
          setDeleteOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleDeletePopupShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeletePopupShortcut);
    };
  }, [deleteOpen, renameOpen]);

  // Hotkey to confirm delete prompt by pressing enter button
  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      // If the enter button is pressed (while the delete dialog is open) then automatically deletes the timetable
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (deleteOpen && event.key === 'Enter') {
        event.preventDefault();
        deleteConfirm?.focus();
        deleteConfirm?.click();
      }
    };

    document.addEventListener('keydown', handleDeleteEnterShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeleteEnterShortcut);
    };
  }, [deleteOpen]);

  // Hotkey to confirm rename by pressing enter button
  useEffect(() => {
    const handleRenameEnterShortcut = (event: KeyboardEvent) => {
      // If the enter button is pressed (while the rename dialog is open) then automatically renames the timetable
      const renameConfirm = document.getElementById('confirm-rename-button');
      if (renameOpen && event.key === 'Enter') {
        event.preventDefault();
        renameConfirm?.focus();
        renameConfirm?.click();
      }
    };

    document.addEventListener('keydown', handleRenameEnterShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleRenameEnterShortcut);
    };
  }, [renameOpen]);

  /**
   * Function to handle the restore deleted timetable snackbar
   */
  // Closes the restore deleted timetable alert
  const handleRestoreClose = () => {
    setOpenRestoreAlert(false);
  };

  // Action button for the restore deleted timetable snackbar
  const restoreTimetable = (
    <>
      <Button
        sx={{ color: '#3a76f8', fontSize: 'small' }}
        onClick={() => {
          alertFunction();
          setOpenRestoreAlert(false);
        }}
      >
        Undo
      </Button>
      <IconButton aria-label="close" color="inherit" onClick={handleRestoreClose} sx={{ color: '#3a76f8' }}>
        <Close fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <>
      <StyledMenu
        open={anchorElement !== null}
        anchorReference="anchorPosition"
        anchorPosition={anchorElement !== null ? { top: anchorElement.y, left: anchorElement.x } : undefined}
        onClose={handleMenuClose}
        autoFocus={false}
      >
        <MenuItem onClick={handleRenameOpen}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateTimetable}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip title={deleteTimetabletip}>
          <MenuItem onClick={() => setDeleteOpen(true)}>
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'red', opacity: '85%' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: 'red', opacity: '85%' }}>Delete</ListItemText>
          </MenuItem>
        </Tooltip>
      </StyledMenu>
      {/* Rename timetable Dialog  */}
      <Dialog open={renameOpen} maxWidth="sm" onClose={() => { handleRenameClose(false); handleMenuClose() }}>
        <StyledTopIcons>
          <IconButton aria-label="close" onClick={() => handleRenameClose(false)}>
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
              onChange={(e) => handleRenameChange(e)}
              error={renamedErr}
            />
          </ListItem>
        </StyledDialogContent>

        <ExecuteButton
          variant="contained"
          color="primary"
          id="confirm-rename-button"
          disableElevation
          onClick={() => handleRenameClose(true)}
          disabled={renamedString === '' || renamedErr}
        >
          <Save />
          SAVE
        </ExecuteButton>
      </Dialog>

      {/* Delete timetable Dialog  */}
      <Dialog maxWidth="xs" open={deleteOpen} onClose={handleMenuClose}>
        <StyledTitleContainer>
          <StyledDialogContent>Delete current timetable?</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button onClick={handleMenuClose}>Cancel</Button>
          <Button
            id="confirm-delete-button"
            onClick={() => {
              handleDeleteTimetable(selectedTimetable);
              handleMenuClose();
            }}
          >
            Delete
          </Button>
        </StyledDialogButtons>
      </Dialog>
      {/* Restore deleted timetable Alert */}
      <StyledSnackbar
        open={openRestoreAlert}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setOpenRestoreAlert(false)}
        message="Timetable Deleted"
        action={restoreTimetable}
      />
    </>
  );
};

export default TimetableTabContextMenu;
