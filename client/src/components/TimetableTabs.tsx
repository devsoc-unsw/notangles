import { Box, Tabs, Tab, MenuList, MenuItem, Menu, Dialog, DialogTitle, TextField, Button } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import storage from '../utils/storage';
import { Add, MoreHoriz, ContentCopy, EditOutlined, DeleteOutline } from '@mui/icons-material';

const TimetableTabs: React.FC = () => {
  type TimetableData = {
    name: String;
    selectedCourses: Array<Object>;
    selectedClasses: Object;
    createdEvents: Object;
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renamedString, setRenamedString] = useState<String>("");

  const {
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
  } = useContext(AppContext);

  const {
    selectedCourses,
    setSelectedCourses,
    selectedClasses,
    setSelectedClasses,
    createdEvents,
    setCreatedEvents
  } = useContext(CourseContext);

  //FOR LATER WHEN WE WANT TO STYLE OUR TABS FURTHER
  const TabStyle = {
    borderStyle: 'solid',
    borderWidth: '2px',
    borderRadius: '10px 10px 0 0',
    color: 'grey',
    margin: '3px 0 0 0',
    boxShadow: '2px -2px 2px currentcolor',
    '&.Mui-selected': { color: 'blue' },
  };

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
    }
  };

  // EXPERIMENTAL: Currently adds a new timetable to local storage
  // Future feature: should have a defined constant for max size
  const handleCreateTimetable = () => {
    const nextIndex = displayTimetables.length;

    const newTimetable: TimetableData = {
      name: `Timetable${nextIndex}`,
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    };
    storage.set('timetables', [...displayTimetables, newTimetable]);

    setDisplayTimetables([...displayTimetables, newTimetable]);

    //Should switch current timetable to the new timetable
    setSelectedTimetable(nextIndex);
  };

  // EXPERIMENTAL: Handles the switching timetables by changing the selectedCourses, selectedClasses and createdEvents to display.
  const HandleSwitchTimetables = (timetableIndex: number) => {
    // updating data to be displayed for the new timetable.
    setSelectedClasses(displayTimetables[timetableIndex].selectedClasses);
    setSelectedCourses(displayTimetables[timetableIndex].selectedCourses);
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

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuRename = () => {
    setRenameOpen(true);
    setRenamedString(displayTimetables[selectedTimetable].name);
  };

  const handleRenameClose = () => {
    let newTimetables = [...displayTimetables];
    newTimetables[selectedTimetable].name = renamedString;

    storage.set('timetables', [...newTimetables]);
    setDisplayTimetables([...newTimetables]);

    setRenameOpen(false);
  }

  return (
    <Box sx={{ paddingTop: '10px' }}>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <ContentCopy fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleMenuRename}>
          <EditOutlined fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteOutline fontSize="small" onClick={() => handleDeleteTimetable(selectedTimetable)} />
        </MenuItem>
      </Menu>
      <Tabs value={selectedTimetable}>
        {displayTimetables.map((timetable: TimetableData, index: number) => (
          <Tab
            key={index}
            label={timetable.name}
            sx={TabStyle}
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
        <Tab icon={<Add />} onClick={handleCreateTimetable} />
      </Tabs>
      <Dialog onClose={handleRenameClose} open={renameOpen}>
        <DialogTitle>Rename Timetable</DialogTitle>
        <TextField
          sx={{ padding: '10px', width: '160px', alignSelf: 'center' }}
          id="outlined-basic"
          variant="outlined"
          value={renamedString}
          onChange={(e) => setRenamedString(e.target.value)}
        />
        <Button
          sx={{ margin: '10px', width: '80px', alignSelf: 'center' }}
          variant="contained"
          onClick={() => handleRenameClose()}
        >OK</Button>
      </Dialog>
    </Box>
  );
};
export { TimetableTabs };
