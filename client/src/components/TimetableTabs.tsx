import { Box, Tabs, Tab, MenuList, MenuItem, Menu } from '@mui/material';
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
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

  const {
    is12HourMode,
    isDarkMode,
    isSquareEdges,
    isShowOnlyOpenClasses,
    isDefaultUnscheduled,
    isHideClassInfo,
    isHideExamClasses,
    isConvertToLocalTimezone,
    setAlertMsg,
    setErrorVisibility,
    days,
    term,
    year,
    setDays,
    earliestStartTime,
    setEarliestStartTime,
    latestEndTime,
    setLatestEndTime,
    setTerm,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    setTermName,
    setTermNumber,
    setCoursesList,
    setLastUpdated,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
  } = useContext(AppContext);

  //FOR LATER WHEN WE WANT TO STYLE OUR TABS FURTHER
  const TabStyle = {};

  // EXPERIMENTAL: Currently removes a timetable from local storage.
  // Intended behaviour is a placeholder for the menu -> delete on the current tab
  const handleDeleteTimetable = (targetIndex: number) => {
    const oldTimetables = storage.get('timetables');
    // If only one tab then prevent the delete
    if (oldTimetables.length > 1) {
      // Intended behaviour: closing current tab will move to the NEXT (+1) tab, unless it is the last tab
      let newIndex = targetIndex + 1;
      if (newIndex >= oldTimetables.length) {
        newIndex = targetIndex - 1;
      }

      const newTimetables = oldTimetables.filter((timetable: TimetableData, index: number) => index !== targetIndex);
      storage.set('timetables', newTimetables);
      setDisplayTimetables(newTimetables);
      setSelectedTimetable(newIndex);
    }
  };

  // EXPERIMENTAL: Currently adds a new timetable to local storage
  // Future feature: should have a defined constant for max size
  const handleCreateTimetable = () => {
    const oldTimetables = storage.get('timetables');
    const nextIndex = oldTimetables.length;

    const newTimetable: TimetableData = {
      name: `Timetable${nextIndex}`,
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    };
    storage.set('timetables', [...oldTimetables, newTimetable]);

    setDisplayTimetables([...oldTimetables, newTimetable]);

    //Should switch current timetable to the new timetable
    setSelectedTimetable(nextIndex);
  };

  // MENU HANDLERS
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <ContentCopy fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditOutlined fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteOutline fontSize="small" onClick={() => handleDeleteTimetable(selectedTimetable)} />
        </MenuItem>
      </Menu>
      <Tabs value={selectedTimetable}>
        {displayTimetables.map((timetable: TimetableData, index: number) => (
          <Tab
            label={timetable.name}
            sx={TabStyle}
            onClick={() => setSelectedTimetable(index)}
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
        <Tab icon={<Add onClick={handleCreateTimetable} />}></Tab>
      </Tabs>
    </Box>
  );
};
export { TimetableTabs };
