import { Box, Tabs, Tab, MenuItem, Menu, Dialog, DialogTitle, TextField, DialogActions, Button, Tooltip } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import storage from '../utils/storage';
import { Add, MoreHoriz, ContentCopy, EditOutlined, DeleteOutline } from '@mui/icons-material';
import { ExecuteButton } from '../styles/CustomEventStyles';
import { darkTheme, lightTheme } from '../constants/theme';
import { Activity, ClassData, TimetableData, InInventory, SelectedClasses } from '../interfaces/Periods';

const TimetableTabs: React.FC = () => {
  const TIMETABLE_LIMIT = 13;

  type TabTheme = {
    containerBackground: String;
    tabBorderColor: String;
    tabTextColor: String;
    tabHoverColor: String;
    tabBackgroundColor: String;
    tabSelectedText: String;
  };

  const tabThemeLight: TabTheme = {
    containerBackground: '#eeeeee',
    tabBorderColor: '#bbbbbb',
    tabTextColor: '#808080',
    tabHoverColor: '#ffffff',
    tabBackgroundColor: '#ffffff',
    tabSelectedText: 'primary',
  };

  const tabThemeDark: TabTheme = {
    containerBackground: '#2f2f2f',
    tabBorderColor: '#bbbbbb',
    tabTextColor: '#808080',
    tabHoverColor: '#444444',
    tabBackgroundColor: '#444444',
    tabSelectedText: '#ffffff',
  };

  const {
    isDarkMode,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setErrorVisibility,
  } = useContext(AppContext);

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
  const [renamedString, setRenamedString] = useState<String>('');
  const [renamedHelper, setrenamedHelper] = useState<String>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);

  const AddIconStyle = {
    position: 'sticky',
    right: '0px',
    padding: '10px',
    minWidth: '50px',
    minHeight: '50px',
    transition: 'background-color 0.1s',
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: `${tabTheme.tabHoverColor}`,
    },
  };

  const TabContainerStyle = {
    backgroundColor: `${tabTheme.containerBackground}`,
    borderRadius: '10px',
  };

  //FOR LATER WHEN WE WANT TO STYLE OUR TABS FURTHER
  const TabStyle = (index: Number) => {
    let style = {
      minHeight: '50px',
      minWidth: '150px',
      maxWidth: '150px',
      paddingTop: '3px',
      paddingBottom: '3px',
      borderStyle: 'solid',
      borderWidth: '0px',
      borderRadius: '10px',
      borderColor: `${tabTheme.tabBorderColor}`,
      color: `${tabTheme.tabTextColor}`,
      margin: '0 0 0 0',
      marginLeft: '-2px',
      transition: 'background-color 0.1s',
      '&.Mui-selected': {
        color: `${tabTheme.tabSelectedText}`,
        backgroundColor: `${tabTheme.tabBackgroundColor}`,
        boxShadow: `inset 0 0 7px ${theme.palette.primary.main}`,
        borderWidth: '1px',
        borderColor: `${theme.palette.primary.main}`,
        zIndex: '1',
      },
      '&:active': {
        cursor: 'move',
      },
      '&:hover': {
        backgroundColor: `${tabTheme.tabHoverColor}`,
      },
    };

    if (index === 0) {
      style.marginLeft = '0px';
    }

    return style;
  };

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

  // EXPERIMENTAL: Currently removes a timetable from local storage.
  // Intended behaviour is a placeholder for the menu -> delete on the current tab
  const handleDeleteTimetable = (targetIndex: number) => {
    // If only one tab then prevent the delete
    if (displayTimetables.length > 1) {
      // Intended behaviour: closing current tab will remain on the same index unless it is the last tab
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
    } else {
      setAlertMsg('Must have at least 1 timetable');
      setErrorVisibility(true);
    }
  };

  // EXPERIMENTAL: Currently adds a new timetable to local storage
  // Future feature: should have a defined constant for max size
  const handleCreateTimetable = () => {
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const nextIndex = displayTimetables.length;

      const newTimetable: TimetableData = {
        name: 'New Timetable', //`Timetable${nextIndex}`,
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

  // EXPERIMENTAL: Handles the switching timetables by changing the selectedCourses, selectedClasses and createdEvents to display.
  const handleSwitchTimetables = (timetableIndex: number) => {
    setSelectedCourses(displayTimetables[timetableIndex].selectedCourses);
    setSelectedClasses(displayTimetables[timetableIndex].selectedClasses);
    setCreatedEvents(displayTimetables[timetableIndex].createdEvents);
    setSelectedTimetable(timetableIndex);
  };

  // EXPERIMENTAL: Rerenders the timetables component after insertion/deletion (when selected timetable changes)
  useEffect(() => {
    const savedTimetables = storage.get('timetables');
    // checking if a save exists and if so update the timetables to display.
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

  // Sets tab theme when changing UI mode
  useEffect(() => {
    setTabTheme(isDarkMode ? tabThemeDark : tabThemeLight);
  }, [isDarkMode]);

  // MENU HANDLERS
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

  const handleDuplicateTimetable = () => {
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const currentTimetable = displayTimetables[selectedTimetable];

      const newTimetable = {
        name: currentTimetable.name + ' - Copy',
        selectedClasses: copyClasses(currentTimetable.selectedClasses),
        selectedCourses: currentTimetable.selectedCourses,
        createdEvents: currentTimetable.createdEvents
      }

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

  // EXPERIMENTAL: Function to create a deep copy of timetable classes
  const copyClasses = (oldClasses: SelectedClasses) => {
    const newClasses: SelectedClasses = {};

    Object.entries(oldClasses).forEach(([courseCode, activities]) => {
      const activityCopy: Record<Activity, ClassData | InInventory> = {};

      Object.entries(activities).forEach(([activity, classData]) => {
        activityCopy[activity] = classData !== null ? { ...classData } : null;
      });
      newClasses[courseCode] = { ...activityCopy };
    });

    return newClasses;
  };

  // EXPERIEMENTAL: Hotkey for creating new timetables
  useEffect(() => {
    const handleCreateTimetableShortcut = (event: KeyboardEvent) => {
      const createButton = document.getElementById('create-timetables-button');

      // Ctrl+Enter on Windows or Cmd+Enter on Mac creates new timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        if (event.key === "Enter") {
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

  // EXPERIEMENTAL: Hotkeys for deleting timetables
  useEffect(() => {
    const handleDeletePopupShortcut = (event: KeyboardEvent) => {
      // Ctrl+Backspace on Windows or Cmd+Delete on Mac deletes selected timetable
      if ((!isMacOS && event.ctrlKey) || (isMacOS && event.metaKey)) {
        if (event.key === "Backspace") {
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

  // EXPERIEMENTAL: Hotkey to confirm delete by pressing enter button
  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      // If the enter button is pressed (while the delete dialog is open) then automatically deletes the timetable
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (deleteOpen && (event.key === "Enter")) {
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

  // EXPERIEMENTAL: Hotkey to confirm rename by pressing enter button
  useEffect(() => {
    const handleRenameEnterShortcut = (event: KeyboardEvent) => {
      // If the enter button is pressed (while the rename dialog is open) then automatically renames the timetable
      const renameConfirm = document.getElementById('confirm-rename-button');
      if (renameOpen && (event.key === "Enter")) {
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

  // EXPERIMENTAL: Handle drag start (triggers whenever a tab is clicked)
  const handleTabDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragTab.current = index;
    handleSwitchTimetables(dragTab.current);
  };

  // EXPERIMENTAL: Handle drag enter (triggers whenever the user drags over another tab)
  const handleTabDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverTab.current = index;
    handleSortTabs();
  };

  // EXPERIMENTAL: Reordering the tabs when we drag and drop
  const handleSortTabs = () => {
    const newTimetables = [...displayTimetables];
    const draggedItem = newTimetables[dragTab.current];
    newTimetables.splice(dragTab.current, 1);
    newTimetables.splice(dragOverTab.current, 0, draggedItem);
    setDisplayTimetables(newTimetables);
    setSelectedTimetable(dragOverTab.current);
    dragTab.current = dragOverTab.current;
  }

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
          <Tab id='create-timetables-button' icon={<Add />} onClick={handleCreateTimetable} sx={AddIconStyle} />
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
        <ExecuteButton variant="contained" color="primary" id="confirm-rename-button" disableElevation onClick={() => handleRenameClose(true)}>
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
