import { Box, Tabs, Tab, MenuList, MenuItem, Menu, Dialog, DialogTitle, TextField, DialogActions, Button, FormHelperText } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import storage from '../utils/storage';
import { Add, MoreHoriz, ContentCopy, EditOutlined, DeleteOutline } from '@mui/icons-material';
import { contentPadding, darkTheme, lightTheme } from '../constants/theme';

const TimetableTabs: React.FC = () => {
  type TimetableData = {
    name: String;
    selectedCourses: Array<Object>;
    selectedClasses: Object;
    createdEvents: Object;
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<String>('');
  const [renamedHelper, setrenamedHelper] = useState<String>('');
  const [renamedErr, setRenamedErr] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { isDarkMode, selectedTimetable, setSelectedTimetable, displayTimetables, setDisplayTimetables } = useContext(AppContext);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const {
    selectedCourses,
    setSelectedCourses,
    selectedClasses,
    setSelectedClasses,
    createdEvents,
    setCreatedEvents
  } = useContext(CourseContext);

  const TabContainerStyle = {
    backgroundColor: '#eeeeee',
    borderRadius: '10px',
  }
  //FOR LATER WHEN WE WANT TO STYLE OUR TABS FURTHER
  const TabStyle = (index: Number) => {
    let style = {
      minHeight: '50px',
      paddingTop: '3px',
      paddingBottom: '3px',
      borderStyle: 'solid',
      borderWidth: '2px',
      borderRadius: '10px',
      borderColor: '#bbbbbb',
      color: 'grey',
      margin: '0 0 0 0',
      marginLeft: '-2px',
      '&.Mui-selected': { 
        color: 'primary', 
        backgroundColor: '#ffffff', 
        boxShadow: `inset 0 0 7px ${theme.palette.primary.main}`, 
        borderWidth: '1px',
        borderColor: `${theme.palette.primary.main}`,
        zIndex: '1',
      },
    };

    if (index === 0) {style.marginLeft = '0px'}
    
    return style;
  }

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

  // EXPERIMENTAL: Currently removes a timetable from local storage.
  // Intended behaviour is a placeholder for the menu -> delete on the current tab
  const handleDeleteTimetable = (targetIndex: number) => {
    // If only one tab then prevent the delete
    if (displayTimetables.length > 1) {
      // Intended behaviour: closing current tab will move to the NEXT (+1) tab, unless it is the last tab
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
    // users can only create 8 timetables for now.
    if (displayTimetables.length < 8) {
      const nextIndex = displayTimetables.length;

      const newTimetable: TimetableData = {
        name: "New Timetable",//`Timetable${nextIndex}`,
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
  const HandleSwitchTimetables = (timetableIndex: number) => {
    setSelectedCourses(displayTimetables[timetableIndex].selectedCourses);
    setSelectedClasses(displayTimetables[timetableIndex].selectedClasses);
    setCreatedEvents(displayTimetables[timetableIndex].createdEvents);
    setSelectedTimetable(timetableIndex);
  }

  // EXPERIMENTAL: Rerenders the timetables component after insertion/deletion (when selected timetable changes)
  useEffect(() => {
    const savedTimetables = storage.get('timetables');
    // checking if a save exists and if so update the timetables to display.
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

  // MENU HANDLERS
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Collapse all modals and menus
  const handleMenuClose = () => {
    setRenameOpen(false);
    setDeleteOpen(false);
    setAnchorEl(null);
  };

  const handleRenameOpen = () => {
    let timetableName = displayTimetables[selectedTimetable].name;
    setRenamedString(timetableName);
    setrenamedHelper(`${timetableName.length}/30`);
    timetableName.length > 30 ? setRenamedErr(true) : setRenamedErr(false)

    setRenameOpen(true);
  };


  const handleRenameClose = (clickedOk: boolean) => {

    if (!clickedOk) {
      setRenameOpen(false)
      return;
    }

    if (renamedErr) return;

    let newTimetables = [...displayTimetables];
    newTimetables[selectedTimetable].name = renamedString;

    storage.set('timetables', [...newTimetables]);
    setDisplayTimetables([...newTimetables]);

    setRenameOpen(false);
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let str = e.target.value;
    setRenamedString(str);
    setrenamedHelper(`${str.length}/30`);
    str.length > 30 ? setRenamedErr(true) : setRenamedErr(false)
  }

  return (
    <Box sx={{ paddingTop: '10px' }}>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
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
      TabIndicatorProps={{style: {display: 'none'}}}
      >
        {displayTimetables.map((timetable: TimetableData, index: number) => (
          <Tab
            key={index}
            label={timetable.name}
            sx={TabStyle(index)}
            onClick={() => HandleSwitchTimetables(index)}
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
        <Tab icon={<Add />} onClick={handleCreateTimetable} sx={{padding: '10px', minWidth: '45px'}}/>
      </Tabs>
      <Dialog onClose={() => handleRenameClose(false)} open={renameOpen}>
        <DialogTitle>Rename Timetable</DialogTitle>
        <TextField
          sx={{ padding: '10px', width: '160px', alignSelf: 'center' }}
          id="outlined-basic"
          variant="outlined"
          helperText={renamedHelper}
          value={renamedString}
          onChange={(e) => handleRenameChange(e)}
          error={renamedErr}
        />
        <Button sx={ModalButtonStyle} variant="contained" onClick={() => handleRenameClose(true)}>
          OK
        </Button>
      </Dialog>
      <Dialog open={deleteOpen} onClose={handleMenuClose}>
        {displayTimetables[selectedTimetable] && (
          <DialogTitle>{`Delete ${displayTimetables[selectedTimetable].name}?`}</DialogTitle>
        )}
        <DialogActions>
          <Button
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
      </Dialog >
    </Box >
  );
};
export { TimetableTabs };
