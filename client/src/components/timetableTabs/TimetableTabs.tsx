import { Box, Tabs, Tab, Tooltip } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import storage from '../../utils/storage';
import { Add, MoreHoriz } from '@mui/icons-material';
import { darkTheme, lightTheme } from '../../constants/theme';
import { TimetableData, CourseData, SelectedClasses, CreatedEvents } from '../../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';
import {
  TabTheme,
  tabThemeDark,
  tabThemeLight,
  createTimetableStyle,
  TimetableTabsContainer,
  TimetableTabContainer,
  StyledTab,
} from '../../styles/TimetableTabStyles';
import TimetableTabContextMenu from './TimetableTabContextMenu';
import { ExpandButton } from '../../styles/DroppedCardStyles';

const TimetableTabs: React.FC = () => {
  const TIMETABLE_LIMIT = 13;

  const {
    isDarkMode,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    setAlertMsg,
    setErrorVisibility,
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } = useContext(CourseContext);
  const [anchorElement, setAnchorElement] = useState<null | { x: number; y: number }>(null);

  const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

  let addTimetabletip = isMacOS ? 'New Tab (Cmd+Enter)' : 'New Tab (Ctrl+Enter)';

  const theme = isDarkMode ? darkTheme : lightTheme;

  const [tabTheme, setTabTheme] = useState<TabTheme>(isDarkMode ? tabThemeDark : tabThemeLight);
  const dragTab = React.useRef<any>(null);
  const dragOverTab = React.useRef<any>(null);

  const { AddIconStyle, TabContainerStyle, TabStyle } = createTimetableStyle(tabTheme, theme);

  useEffect(() => {
    setTabTheme(isDarkMode ? tabThemeDark : tabThemeLight);
  }, [isDarkMode]);

  // Helper function to set the state
  const setTimetableState = (selectedCourses: CourseData[], selectedClasses: SelectedClasses, createdEvents: CreatedEvents, timetableIndex: number) => {
    setSelectedCourses(selectedCourses);
    setSelectedClasses(selectedClasses);
    setCreatedEvents(createdEvents);
    setSelectedTimetable(timetableIndex);
  }

  /**
   * Timetable handlers
   */
  // Creates new timetable
  const handleCreateTimetable = () => {
    // Limiting users to have a maximum of 13 timetables
    if (displayTimetables.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const nextIndex = displayTimetables.length;

      const newTimetable: TimetableData = {
        name: 'New Timetable',
        id: uuidv4(),
        selectedCourses: [],
        selectedClasses: {},
        createdEvents: {},
      };
      storage.set('timetables', [...displayTimetables, newTimetable]);

      setDisplayTimetables([...displayTimetables, newTimetable]);

      // Clearing the selected courses, classes and created events for the new timetable
      setTimetableState([], {}, {}, nextIndex);
    }
  };

  // Fetching the saved timetables from local storage
  useEffect(() => {
    const savedTimetables = storage.get('timetables');
    // checking if a save exists and if so update the timetables to display.
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

  /**
   * Drag and drop functions for rearranging timetable tabs
   */
  // Handles timetable switching by updating the selected courses, classes and events to the new timetable
  const handleSwitchTimetables = (timetableIndex: number) => {
    const { selectedCourses, selectedClasses, createdEvents } = displayTimetables[timetableIndex];
    setTimetableState(selectedCourses, selectedClasses, createdEvents, timetableIndex);
  };

  // Reordering the tabs when they are dragged and dropped
  const handleSortTabs = () => {
    const newTimetables = [...displayTimetables];
    const draggedItem = newTimetables[dragTab.current];
    newTimetables.splice(dragTab.current, 1);
    newTimetables.splice(dragOverTab.current, 0, draggedItem);
    setDisplayTimetables(newTimetables);
    setSelectedTimetable(dragOverTab.current);
    dragTab.current = dragOverTab.current;
  };

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

  /**
   * Dropdown menu tab handlers
   */
  // Left click handler for the three dots icon (editing the timetable tab)
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorElement({ x: e.clientX, y: e.clientY });
  };

  // Right clicking a tab will switch to that tab and open the menu
  const handleRightTabClick = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    handleSwitchTimetables(index);
    // Anchoring the menu to the mouse position
    setAnchorElement({ x: event.clientX, y: event.clientY });
  };

  return (
    <TimetableTabsContainer>
      <TimetableTabContainer
        value={selectedTimetable}
        sx={TabContainerStyle}
        TabIndicatorProps={{ sx: { display: 'none' } }}
        variant="scrollable"
      >
        {displayTimetables.map((timetable: TimetableData, index: number) => (
          <StyledTab
            key={index}
            label={timetable.name}
            sx={TabStyle}
            onClick={() => handleSwitchTimetables(index)}
            onContextMenu={(e) => handleRightTabClick(e, index)}
            icon={
              selectedTimetable === index ? (
                <ExpandButton onClick={handleMenuClick} sx={{ color: 'primary' }}>
                  <MoreHoriz />
                </ExpandButton>
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
        <TimetableTabContextMenu anchorElement={anchorElement} setAnchorElement={setAnchorElement} />
        <Tooltip title={addTimetabletip}>
          <Tab id="create-timetables-button" icon={<Add />} onClick={handleCreateTimetable} sx={AddIconStyle} />
        </Tooltip>
      </TimetableTabContainer>
    </TimetableTabsContainer>
  );
};
export { TimetableTabs };
