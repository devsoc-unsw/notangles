import { Box, Tabs, Tab, MenuItem, Menu, Dialog, DialogTitle, TextField, DialogActions, Button, Tooltip } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import storage from '../utils/storage';
import { Add, MoreHoriz, ContentCopy, EditOutlined, DeleteOutline } from '@mui/icons-material';
import { ExecuteButton } from '../styles/CustomEventStyles';
import { darkTheme, lightTheme } from '../constants/theme';
import { Activity, ClassData, TimetableData, InInventory, SelectedClasses, CreatedEvents } from '../interfaces/Periods';
import { createEventObj } from '../utils/createEvent';
import { v4 as uuidv4 } from 'uuid';
import { TabTheme, tabThemeDark, tabThemeLight, createTimetableStyle } from '../styles/TimetableTabStyles';

const TimetableTabs: React.FC = () => {
  const TIMETABLE_LIMIT = 13;

  const {
    isDarkMode,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setAlertFunction,
    setErrorVisibility,
    setAutoVisibility,
  } = useContext(AppContext);
  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } = useContext(CourseContext);

  const isMacOS = navigator.userAgent.indexOf('Mac') != -1;
  let addTimetabletip = isMacOS ? 'New Tab (Cmd+D)' : 'New Tab (Ctrl+Enter)';
  let deleteTimetabletip = isMacOS ? 'Delete Tab (Cmd+Delete)' : 'Delete Tab (Ctrl+Backspace)';

  const theme = isDarkMode ? darkTheme : lightTheme;

  const [tabTheme, setTabTheme] = useState<TabTheme>(isDarkMode ? tabThemeDark : tabThemeLight);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorCoord, setAnchorCoord] = useState<null | { x: number; y: number }>(null);

  const dragTab = React.useRef<any>(null);
  const dragOverTab = React.useRef<any>(null);

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<string>('');
  const [renamedHelper, setrenamedHelper] = useState<string>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  let prevTimetables: { selected: number; timetables: TimetableData[] } = { selected: 0, timetables: [] };

  const { AddIconStyle, TabContainerStyle, TabStyle, ModalButtonStyle } = createTimetableStyle(tabTheme, theme);
  useEffect(() => {
    setTabTheme(isDarkMode ? tabThemeDark : tabThemeLight);
  }, [isDarkMode]);

  /** DEEP COPY FUNCTIONS - Helper functions used when copying/deleting timetables */
  const duplicateClasses = (selectedClasses: SelectedClasses) => {
    const newClasses: SelectedClasses = {};

    Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
      const newActivityCopy: Record<Activity, ClassData | InInventory> = {};

      Object.entries(activities).forEach(([activity, classData]) => {
        newActivityCopy[activity] = classData !== null ? { ...classData } : null;
      });
      newClasses[courseCode] = { ...newActivityCopy };
    });

    return newClasses;
  };

  const duplicateEvents = (oldEvents: CreatedEvents) => {
    const newEvents: CreatedEvents = {};

    Object.entries(oldEvents).forEach(([code, period]) => {
      const newEvent = createEventObj(
        period.event.name,
        period.event.location,
        period.event.description,
        period.event.color,
        period.time.day,
        period.time.start,
        period.time.end
      );
      newEvents[newEvent.event.id] = newEvent;
    });
    return newEvents;
  };

  /**
   * Timetable handlers
   */
  // Handler for deleting timetable from displayTimetables
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
          };
        }),
      };

      // Closing current tab will remain on the same index unless it is the last tab
      let newIndex = targetIndex;
      if (newIndex === displayTimetables.length - 1) {
        newIndex = targetIndex - 1;
      }
      const newTimetables = displayTimetables.filter((timetable: TimetableData, index: number) => index !== targetIndex);
      setDisplayTimetables(newTimetables);
      setSelectedTimetable(newIndex);
      setSelectedCourses(newTimetables[newIndex].selectedCourses);
      setSelectedClasses(newTimetables[newIndex].selectedClasses);
      setCreatedEvents(newTimetables[newIndex].createdEvents);

      setAlertMsg('Deleted timetable - Click to undo');
      setAlertFunction(() => () => {
        setDisplayTimetables(prevTimetables.timetables);
        setSelectedTimetable(prevTimetables.selected);
        setSelectedCourses(prevTimetables.timetables[prevTimetables.selected].selectedCourses);
        setSelectedClasses(prevTimetables.timetables[prevTimetables.selected].selectedClasses);
        setCreatedEvents(prevTimetables.timetables[prevTimetables.selected].createdEvents);
        return;
      });
      setAutoVisibility(true);
    } else {
      setAlertMsg('Must have at least 1 timetable');
      setErrorVisibility(true);
    }
  };

  // Creates new timetable
  const handleCreateTimetable = () => {
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const nextIndex = displayTimetables.length;

      const newTimetable: TimetableData = {
        name: 'New Timetable', //`Timetable${nextIndex}`,
        id: uuidv4(),
        selectedCourses: [],
        selectedClasses: {},
        createdEvents: {},
      };
      storage.set('timetables', [...displayTimetables, newTimetable]);

      setDisplayTimetables([...displayTimetables, newTimetable]);

      //Should switch current timetable to the new timetable
      setSelectedTimetable(nextIndex);
      setSelectedCourses([]);
      setSelectedClasses({});
      setCreatedEvents({});
    }
  };

  // Handles the switching timetables by changing the selectedCourses, selectedClasses and createdEvents to display
  const handleSwitchTimetables = (timetableIndex: number) => {
    setSelectedCourses(displayTimetables[timetableIndex].selectedCourses);
    setSelectedClasses(displayTimetables[timetableIndex].selectedClasses);
    setCreatedEvents(displayTimetables[timetableIndex].createdEvents);
    setSelectedTimetable(timetableIndex);
  };

  // Rerenders the timetables component after insertion/deletion (when selected timetable changes)
  useEffect(() => {
    const savedTimetables = storage.get('timetables');
    // checking if a save exists and if so update the timetables to display.
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

  // Handle drag start (triggers whenever a tab is clicked)
  const handleTabDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragTab.current = index;
    handleSwitchTimetables(dragTab.current);
  };

  // Handle drag enter (triggers whenever the user drags over another tab)
  const handleTabDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverTab.current = index;
    handleSortTabs();
  };

  // Reordering the tabs when we drag and drop
  const handleSortTabs = () => {
    const newTimetables = [...displayTimetables];
    const draggedItem = newTimetables[dragTab.current];
    newTimetables.splice(dragTab.current, 1);
    newTimetables.splice(dragOverTab.current, 0, draggedItem);
    setDisplayTimetables(newTimetables);
    setSelectedTimetable(dragOverTab.current);
    dragTab.current = dragOverTab.current;
  };

  /**
   * Dropdown menu tab handlers
   */
  // Left click handler on three dots icon
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Right clicking a tab switch to that tab and open the menu
  const handleRightTabClick = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    handleSwitchTimetables(index);
    setAnchorCoord({ x: event.clientX, y: event.clientY });
  };

  // Collapse all modals and menus
  const handleMenuClose = () => {
    setRenameOpen(false);
    setDeleteOpen(false);
    setAnchorEl(null);
    setAnchorCoord(null);
  };

  // Handle opening the rename dialog
  const handleRenameOpen = () => {
    let timetableName = displayTimetables[selectedTimetable].name;
    setRenamedString(timetableName);
    setrenamedHelper(`${timetableName.length}/30`);
    timetableName.length > 30 ? setRenamedErr(true) : setRenamedErr(false);

    setRenameOpen(true);
  };

  // Handle closing the rename dialog
  const handleRenameClose = (clickedOk: boolean) => {
    // Checks if the user clicked out of the dialog or clicked Ok
    if (!clickedOk) {
      setRenameOpen(false);
      return;
    }

    if (renamedErr) return;

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
    setrenamedHelper(`${str.length}/30`);
    str.length > 30 ? setRenamedErr(true) : setRenamedErr(false);
  };

  // Handler for duplicate icon click
  const handleDuplicateTimetable = () => {
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const currentTimetable = displayTimetables[selectedTimetable];

      const newTimetable = {
        name: currentTimetable.name + ' - Copy',
        id: uuidv4(),
        selectedClasses: duplicateClasses(currentTimetable.selectedClasses),
        selectedCourses: currentTimetable.selectedCourses,
        createdEvents: duplicateEvents(currentTimetable.createdEvents),
      };

      // Insert the new timetable after the current one
      const newTimetables = [
        ...displayTimetables.slice(0, selectedTimetable + 1),
        newTimetable,
        ...displayTimetables.slice(selectedTimetable + 1),
      ];

      // Update the state variables
      storage.set('timetables', newTimetables);
      setDisplayTimetables(newTimetables);
      setSelectedCourses(newTimetable.selectedCourses);
      setSelectedClasses(newTimetable.selectedClasses);
      setCreatedEvents(newTimetable.createdEvents);
      setSelectedTimetable(selectedTimetable + 1);
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
        if (event.key === 'Enter') {
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
  }, []);

  // Hotkeys for deleting timetables
  useEffect(() => {
    const handleDeletePopupShortcut = (event: KeyboardEvent) => {
      // Ctrl+Backspace on Windows or Cmd+Delete on Mac deletes selected timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        if (event.key === 'Backspace') {
          setDeleteOpen(!deleteOpen);
        }
      }
    };

    document.addEventListener('keydown', handleDeletePopupShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeletePopupShortcut);
    };
  }, []);

  // Hotkey to confirm delete by pressing enter button
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
  }, [deleteOpen, handleDeleteTimetable, handleMenuClose, selectedTimetable]);

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
  }, [deleteOpen, handleDeleteTimetable, handleMenuClose, selectedTimetable]);

  return (
    <Box sx={{ paddingTop: '10px', overflow: 'auto' }}>
      <Menu
        anchorReference={anchorEl === null ? 'anchorPosition' : 'anchorEl'}
        anchorEl={anchorEl}
        anchorPosition={anchorCoord !== null ? { top: anchorCoord.y, left: anchorCoord.x } : undefined}
        open={Boolean(anchorEl) || anchorCoord !== null}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDuplicateTimetable()}>
          <ContentCopy fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleRenameOpen}>
          <EditOutlined fontSize="small" />
        </MenuItem>
        <Tooltip title={deleteTimetabletip}>
          <MenuItem onClick={() => setDeleteOpen(true)}>
            <DeleteOutline fontSize="small" />
          </MenuItem>
        </Tooltip>
      </Menu>
      <Tabs
        value={selectedTimetable}
        sx={TabContainerStyle}
        TabIndicatorProps={{ style: { display: 'none' } }}
        variant="scrollable"
      >
        {displayTimetables.map((timetable: TimetableData, index: number) => (
          <Tab
            key={index}
            label={timetable.name}
            sx={TabStyle(index)}
            onClick={() => handleSwitchTimetables(index)}
            onContextMenu={(e) => handleRightTabClick(e, index)}
            icon={
              selectedTimetable === index ? (
                <span onClick={handleMenuClick}>
                  <MoreHoriz />
                </span>
              ) : (
                <></>
              )
            }
            iconPosition="end"
            draggable={true}
            onDragStart={(e) => handleTabDragStart(e, index)}
            onDragEnter={(e) => handleTabDragEnter(e, index)}
            onDragEnd={handleSortTabs}
            onDragOver={(e) => e.preventDefault()}
          />
        ))}
        <Tooltip title={addTimetabletip}>
          <Tab id="create-timetables-button" icon={<Add />} onClick={handleCreateTimetable} sx={AddIconStyle} />
        </Tooltip>
      </Tabs>
      <Dialog onClose={() => handleRenameClose(false)} open={renameOpen}>
        <DialogTitle sx={{ alignSelf: 'center', paddingTop: '10px', paddingBottom: '0px' }}>Rename Timetable</DialogTitle>
        <Box
          sx={{
            backgroundColor: `${theme.palette.primary.main}`,
            minHeight: '4px',
            width: '100px',
            alignSelf: 'center',
            borderRadius: '5px',
            marginBottom: '8px',
          }}
        ></Box>
        <TextField
          sx={{ padding: '5px', paddingTop: '10px', width: '180px', alignSelf: 'center' }}
          id="outlined-basic"
          variant="outlined"
          helperText={renamedHelper}
          value={renamedString}
          onChange={(e) => handleRenameChange(e)}
          error={renamedErr}
        />
        <ExecuteButton
          variant="contained"
          color="primary"
          id="confirm-rename-button"
          disableElevation
          onClick={() => handleRenameClose(true)}
        >
          OK
        </ExecuteButton>
      </Dialog>
      <Dialog open={deleteOpen} onClose={handleMenuClose}>
        {displayTimetables[selectedTimetable] && (
          <DialogTitle>{`Delete ${displayTimetables[selectedTimetable].name}?`}</DialogTitle>
        )}
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            id="confirm-delete-button"
            sx={ModalButtonStyle}
            variant="contained"
            onClick={() => {
              handleDeleteTimetable(selectedTimetable);
              handleMenuClose();
            }}
          >
            Yes
          </Button>
          <Button sx={ModalButtonStyle} variant="contained" onClick={handleMenuClose}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export { TimetableTabs };
