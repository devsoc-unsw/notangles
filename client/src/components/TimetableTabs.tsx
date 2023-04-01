import { Box, Tabs, Tab, MenuItem, Menu, Dialog, DialogTitle, TextField, DialogActions, Button } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import storage from '../utils/storage';
import { Add, MoreHoriz, ContentCopy, EditOutlined, DeleteOutline } from '@mui/icons-material';
import { ExecuteButton } from '../styles/CustomEventStyles';
import { darkTheme, lightTheme } from '../constants/theme';
import getCourseInfo from '../api/getCourseInfo';
import { CourseData } from '../interfaces/Periods';

const TimetableTabs: React.FC = () => {
  const TIMETABLE_LIMIT = 10;

  type TimetableData = {
    name: String;
    selectedCourses: Array<Object>;
    selectedClasses: Object;
    createdEvents: Object;
  };

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
    isConvertToLocalTimezone,
    term,
    year,
    isDarkMode,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setErrorVisibility,
  } = useContext(AppContext);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [tabTheme, setTabTheme] = useState<TabTheme>(isDarkMode ? tabThemeDark : tabThemeLight);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorCoord, setAnchorCoord] = useState<null | { x: number; y: number }>(null);

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<String>('');
  const [renamedHelper, setrenamedHelper] = useState<String>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);

  const AddIconStyle = {
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
        selectedCourses: [...currentTimetable.selectedCourses],
        selectedClasses: { ...currentTimetable.selectedClasses },
        createdEvents: { ...currentTimetable.createdEvents },
      };

      // const codes: string[] = currentTimetable.selectedCourses.map((course: CourseData) => course.code);

      // Promise.all(
      //   codes.map((code) =>
      //     getCourseInfo(year, term, code, isConvertToLocalTimezone).catch((err) => {
      //       return err;
      //     })
      //   )
      // ).then((result) => {
      //   const addedCourses = result.filter((course) => course.code !== undefined) as CourseData[];

      //   let newSelectedCourses = [...selectedCourses];

      //   // Update the existing courses with the new data (for changing timezones).
      //   addedCourses.forEach((addedCourse) => {
      //     if (newSelectedCourses.find((x) => x.code === addedCourse.code)) {
      //       const index = newSelectedCourses.findIndex((x) => x.code === addedCourse.code);
      //       newSelectedCourses[index] = addedCourse;
      //     } else {
      //       newSelectedCourses.push(addedCourse);
      //     }
      //   });
      //   console.log(newSelectedCourses);
      //   // setSelectedCourses(newSelectedCourses);
      // });
      // Object.keys(newTimetable.selectedClasses).forEach((courseCode) => {
      //   Object.keys(newTimetable.selectedClasses[courseCode]).forEach((activity) => {
      //     newTimetable.selectedClasses[courseCode][activity].id = 'hello';
      //   });
      // });


      // Insert the new timetable after the current one
      const newTimetables = [
        ...displayTimetables.slice(0, selectedTimetable + 1),
        newTimetable,
        ...displayTimetables.slice(selectedTimetable + 1),
      ];

      // Update the state variables
      storage.set('timetables', newTimetables);
      setDisplayTimetables(newTimetables);
      setSelectedTimetable(selectedTimetable + 1);
      setSelectedCourses(newTimetable.selectedCourses);
      setSelectedClasses(newTimetable.selectedClasses);
      setCreatedEvents(newTimetable.createdEvents);

      handleMenuClose();

    }
  };

  // EXPERIEMENTAL: Hotkeys for deleting timetables (CTRL+BACKSPACE) then delete to quick select 'OK'
  useEffect(() => {
    const handleDeletePopupShortcut = (event: KeyboardEvent) => {
      // If the ctrl+backspace keys are pressed then opens the delete dialog menu
      if (event.ctrlKey && (event.key === "Backspace")) {
        setDeleteOpen(!deleteOpen);
      }
    };

    document.addEventListener('keydown', handleDeletePopupShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeletePopupShortcut);
    };
  }, []);

  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      // If the enter button is pressed (while the delete dialog is open) then automatically deletes the timetable
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (deleteOpen) {
        event.preventDefault();
        if (event.key === "Enter") {
          deleteConfirm?.focus();
          deleteConfirm?.click();
        }
      }
    };

    document.addEventListener('keydown', handleDeleteEnterShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeleteEnterShortcut);
    };
  }, [deleteOpen, handleDeleteTimetable, handleMenuClose, selectedTimetable]);


  return (
    <Box sx={{ paddingTop: '10px' }}>
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
        <MenuItem onClick={() => setDeleteOpen(true)}>
          <DeleteOutline fontSize="small" />
        </MenuItem>
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
          />
        ))}
        <Tab icon={<Add />} onClick={handleCreateTimetable} sx={AddIconStyle} />
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
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={() => handleRenameClose(true)}>
          OK
        </ExecuteButton>
      </Dialog>
      <Dialog open={deleteOpen} onClose={handleMenuClose}>
        {displayTimetables[selectedTimetable] && (
          <DialogTitle>{`Delete ${displayTimetables[selectedTimetable].name}?`}</DialogTitle>
        )}
        <DialogActions>
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
