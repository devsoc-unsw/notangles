import { Close, Edit, EditNote, FileCopy, Save } from '@mui/icons-material';
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
import React, { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { CourseData, CreatedEvents, SelectedClasses, TimetableData } from '../../interfaces/Periods';
import { TimetableTabContextMenuProps } from '../../interfaces/PropTypes';
import {
  StyledDialogButtons,
  StyledDialogContent,
  StyledDialogTitle,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../styles/ControlStyles';
import { ExecuteButton, RedDeleteIcon, RedListItemText, StyledMenu } from '../../styles/CustomEventStyles';
import { StyledSnackbar } from '../../styles/TimetableTabStyles';
import storage from '../../utils/storage';
import { duplicateClasses, duplicateEvents } from '../../utils/timetableHelpers';

const TimetableTabContextMenu: React.FC<TimetableTabContextMenuProps> = ({ anchorElement, setAnchorElement }) => {
  const TIMETABLE_LIMIT = 13;

  const {
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    term,
    setAlertMsg,
    setAlertFunction,
    alertFunction,
    setErrorVisibility,
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, assignedColors, setAssignedColors } =
    useContext(CourseContext);

  const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

  const deleteTimetabletip = isMacOS ? 'Delete Tab (Cmd+Delete)' : 'Delete Tab (Ctrl+Backspace)';

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
    timetableIndex: number,
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
    if (displayTimetables[term].length > 1) {
      prevTimetables = {
        selected: selectedTimetable,
        timetables: displayTimetables[term].map((timetable: TimetableData) => {
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

      const newIndex = targetIndex === displayTimetables[term].length - 1 ? targetIndex - 1 : targetIndex;

      const newDisplayTimetables = {
        ...displayTimetables,
        [term]: displayTimetables[term].filter((timetable: TimetableData, index: number) => index !== targetIndex),
      };

      // Updating the timetables state to the new timetable index
      setDisplayTimetables(newDisplayTimetables);

      // Destructure and rename (for clarity, do not shadow context variables)
      const {
        selectedCourses: newCourses,
        selectedClasses: newClasses,
        createdEvents: newEvents,
        assignedColors: newColors,
      } = newDisplayTimetables[term][newIndex];
      setTimetableState(newCourses, newClasses, newEvents, newColors, newIndex);

      setOpenRestoreAlert(true);

      // If user chooses to undo the deletion then we will restore the previous state
      setAlertFunction(() => () => {
        const restoredTimetables = {
          ...displayTimetables,
          [term]: prevTimetables.timetables,
        };

        setDisplayTimetables(restoredTimetables);
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
    const timetableName = displayTimetables[term][selectedTimetable].name;
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

    const newTimetables = {
      ...displayTimetables,
      [term]: displayTimetables[term].map((timetable, index) => {
        return index === selectedTimetable ? { ...timetable, name: renamedString } : timetable;
      }),
    };

    storage.set('timetables', newTimetables);
    setDisplayTimetables(newTimetables);

    setRenameOpen(false);
  };

  // Handle changes to the rename text field
  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const str = e.target.value;
    setRenamedString(str);
    setRenamedHelper(`${str.length}/30`);
    str.length > 30 ? setRenamedErr(true) : setRenamedErr(false);
  };

  // Handler to duplicate the selected timetable
  const handleDuplicateTimetable = () => {
    if (displayTimetables[term].length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const currentTimetable = displayTimetables[term][selectedTimetable];

      const newTimetable = {
        name: currentTimetable.name + ' - Copy',
        id: uuidv4(),
        selectedClasses: duplicateClasses(currentTimetable.selectedClasses),
        selectedCourses: currentTimetable.selectedCourses,
        createdEvents: duplicateEvents(currentTimetable.createdEvents),
        assignedColors: currentTimetable.assignedColors,
      };

      const newTimetables = [
        ...displayTimetables[term].slice(0, selectedTimetable + 1),
        newTimetable,
        ...displayTimetables[term].slice(selectedTimetable + 1),
      ];

      const updatedTimetables = {
        ...displayTimetables,
        [term]: newTimetables,
      };

      storage.set('timetables', updatedTimetables);
      setDisplayTimetables(updatedTimetables);
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
        if (event.key === 'Enter' && !deleteOpen && !renameOpen) {
          event.preventDefault();
          createButton?.focus();
          createButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleCreateTimetableShortcut);

    return () => {
      document.removeEventListener('keydown', handleCreateTimetableShortcut);
    };
  }, [deleteOpen, renameOpen]);

  // Hotkey for deleting timetables
  useEffect(() => {
    const handleDeletePopupShortcut = (event: KeyboardEvent) => {
      // Ctrl+Backspace on Windows or Cmd+Delete on Mac deletes the selected timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        if (event.key === 'Backspace' && !renameOpen) {
          setDeleteOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleDeletePopupShortcut);

    return () => {
      document.removeEventListener('keydown', handleDeletePopupShortcut);
    };
  }, [deleteOpen, renameOpen]);

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

  // Hotkey to confirm rename by pressing enter button
  useEffect(() => {
    const handleRenameEnterShortcut = (event: KeyboardEvent) => {
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
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip title={deleteTimetabletip}>
          <MenuItem onClick={() => setDeleteOpen(true)}>
            <ListItemIcon>
              <RedDeleteIcon fontSize="small" />
            </ListItemIcon>
            <RedListItemText>Delete</RedListItemText>
          </MenuItem>
        </Tooltip>
      </StyledMenu>

      {/* Rename timetable Dialog  */}
      <Dialog
        open={renameOpen}
        maxWidth="sm"
        onClose={() => {
          handleRenameClose(false);
          handleMenuClose();
        }}
      >
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
