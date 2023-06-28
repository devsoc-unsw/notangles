import { Box, IconButton, Tabs, Tab, Tooltip } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import storage from '../../utils/storage';
import { Add, MoreHoriz } from '@mui/icons-material';
import { darkTheme, lightTheme } from '../../constants/theme';
import { TimetableData } from '../../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';
import { TabTheme, tabThemeDark, tabThemeLight, createTimetableStyle } from '../../styles/TimetableTabStyles';
import { EditTabPopups } from './EditTabPopups';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';

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
    setAnchorElement,
    setAnchorCoords,
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } = useContext(CourseContext);

  const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

  let addTimetabletip = isMacOS ? 'New Tab (Cmd+Enter)' : 'New Tab (Ctrl+Enter)';

  const theme = isDarkMode ? darkTheme : lightTheme;

  const [tabTheme, setTabTheme] = useState<TabTheme>(isDarkMode ? tabThemeDark : tabThemeLight);
  const dragTab = React.useRef<any>(null);
  const dragOverTab = React.useRef<any>(null);

  const { AddIconStyle, TabContainerStyle2, TabStyle } = createTimetableStyle(tabTheme, theme);

  const TabStyle2 = (index: Number) => {
    let style = {
      boxShadow: '',
      maxWidth: '360px',
      minHeight: '42px',
      minWidth: '118px',
      padding: '3px 16px',
      backgroundColor: '',
      borderStyle: 'solid',
      borderWidth: '0px',
      borderRadius: '10px 10px 0 0',
      borderColor: `${tabTheme.tabBorderColor}`,
      color: `${tabTheme.tabTextColor}`,
      margin: '0 0 0 0',
      marginLeft: '-2px',
      transition: 'background-color 0.1s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: "Roboto,Helvetica,Arial",
      lineHeight: '1.25',
      letterSpacing: '0.02857em',
      flexShrink: '0',
      zIndex: '',
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

    if (index === selectedTimetable) {
      style.color = `#3a76f8`;
      style.backgroundColor = `${tabTheme.tabBackgroundColor}`;
      style.boxShadow = `inset 0 0 7px ${theme.palette.primary.main}`;
      style.borderWidth = '1px';
      style.borderColor = `${theme.palette.primary.main}`;
      style.zIndex = '1';
    }

    return style;
  };

  const ScrollbarStyle = {
    paddingTop: '10px',
    overflow: 'auto',
    "::-webkit-scrollbar": {
      height: '5px'
    }
  }

  useEffect(() => {
    setTabTheme(isDarkMode ? tabThemeDark : tabThemeLight);
  }, [isDarkMode]);


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

      // Should switch current timetable to the new timetable
      setSelectedTimetable(nextIndex);
      // Clearing the selected courses, classes and created events for the new timetable
      setSelectedCourses([]);
      setSelectedClasses({});
      setCreatedEvents({});
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
    setSelectedCourses(displayTimetables[timetableIndex].selectedCourses);
    setSelectedClasses(displayTimetables[timetableIndex].selectedClasses);
    setCreatedEvents(displayTimetables[timetableIndex].createdEvents);
    setSelectedTimetable(timetableIndex);
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

  const handleSortTabs2 = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTimetables = [...displayTimetables];
    const draggedItem = newTimetables[source.index];
    newTimetables.splice(source.index, 1);
    newTimetables.splice(destination.index, 0, draggedItem);
    setDisplayTimetables(newTimetables);
    handleSwitchTimetables2(newTimetables, destination.index);
  }

  // EXPERIMENTAL: Handles the switching timetables by changing the selectedCourses, selectedClasses and createdEvents to display.
  const handleSwitchTimetables2 = (newTimetables: TimetableData[], timetableIndex: number) => {
    setSelectedCourses(newTimetables[timetableIndex].selectedCourses);
    setSelectedClasses(newTimetables[timetableIndex].selectedClasses);
    setCreatedEvents(newTimetables[timetableIndex].createdEvents);
    setSelectedTimetable(timetableIndex);
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
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  // Right clicking a tab will switch to that tab and open the menu
  const handleRightTabClick = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    handleSwitchTimetables(index);

    // Anchoring the menu to the mouse position
    setAnchorCoords({ x: event.clientX, y: event.clientY });
  };

  return (
    <Box sx={ScrollbarStyle}>
      <Box sx={TabContainerStyle2}>
        <DragDropContext
          onDragEnd={handleSortTabs2}
        >
          <Droppable droppableId='tabs' direction='horizontal'>
            {props => (
              <Box
                ref={props.innerRef}
                {...props.droppableProps}
                sx={TabContainerStyle2}
              >
                {displayTimetables.map((timetable: TimetableData, index: number) => (
                  <Draggable draggableId={index.toString()} index={index}>
                    {(props) => (
                      <Box
                        ref={props.innerRef}
                        {...props.draggableProps}
                        {...props.dragHandleProps}
                        key={index}
                        sx={TabStyle2(index)}
                        onClick={() => handleSwitchTimetables(index)}
                        onContextMenu={(e) => handleRightTabClick(e, index)}>
                        {timetable.name}
                        {
                          selectedTimetable === index ? (
                            <span style={{ marginLeft: '8px' }} onClick={handleMenuClick}>
                              <MoreHoriz />
                            </span>
                          ) : (
                            <></>
                          )
                        }
                      </Box>
                    )}
                  </Draggable>
                ))}
                {props.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
        <Tooltip title={addTimetabletip}>
          <IconButton id="create-timetables-button" onClick={handleCreateTimetable} sx={AddIconStyle}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <EditTabPopups />
    </Box>
  );
};
export { TimetableTabs };
