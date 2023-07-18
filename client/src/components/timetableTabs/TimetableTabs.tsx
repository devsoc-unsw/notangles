import React, { useContext, useState, useEffect } from 'react';
import { MoreHoriz } from '@mui/icons-material';
import { Tooltip, Box } from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import storage from '../../utils/storage';
import { darkTheme, lightTheme } from '../../constants/theme';
import { CourseData, TimetableData, SelectedClasses, CreatedEvents } from '../../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';
import {
  TabTheme,
  tabThemeDark,
  tabThemeLight,
  createTimetableStyle,
  TabsSection,
  TabsWrapper,
  StyledTabs,
  StyledIconButton,
  StyledSpan
} from '../../styles/TimetableTabStyles';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import TimetableTabContextMenu from './TimetableTabContextMenu';

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

  const { TabStyle } = createTimetableStyle(tabTheme, theme);

  useEffect(() => {
    setTabTheme(isDarkMode ? tabThemeDark : tabThemeLight);
  }, [isDarkMode]);

  // Helper function to set the timetable state
  const setTimetableState = (
    selectedCourses: CourseData[],
    selectedClasses: SelectedClasses,
    createdEvents: CreatedEvents,
    timetableIndex: number
  ) => {
    setSelectedCourses(selectedCourses);
    setSelectedClasses(selectedClasses);
    setCreatedEvents(createdEvents);
    setSelectedTimetable(timetableIndex);
  };

  /**
   * Timetable handlers
   */
  // Creates new timetable
  const handleCreateTimetable = () => {
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
    if (savedTimetables) {
      setDisplayTimetables(savedTimetables);
    }
  }, []);

  /**
   * Drag and drop functions for rearranging timetable tabs
   */
  // Handles timetable switching by updating the selected courses, classes and events to the new timetable
  const handleSwitchTimetables = (timetables: TimetableData[], timetableIndex: number) => {
    const { selectedCourses, selectedClasses, createdEvents } = timetables[timetableIndex];
    setTimetableState(selectedCourses, selectedClasses, createdEvents, timetableIndex);
  };

  // Reordering the tabs when they are dragged and dropped
  const handleSortTabs = (result: DropResult) => {
    const { destination, source } = result;

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

    handleSwitchTimetables(newTimetables, destination.index);
  }

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
    handleSwitchTimetables(displayTimetables, index);

    // Anchoring the menu to the mouse position
    setAnchorElement({ x: event.clientX, y: event.clientY });
  };

  return (
    <TabsSection>
      <TabsWrapper tabTheme={tabTheme}>
        <DragDropContext
          onDragEnd={handleSortTabs}
        >
          <Droppable droppableId='tabs' direction='horizontal'>
            {props => (
              <StyledTabs
                ref={props.innerRef}
                {...props.droppableProps}
              >
                {displayTimetables.map((timetable: TimetableData, index: number) => (
                  <Draggable draggableId={index.toString()} index={index}>
                    {(props) => (
                      <Box
                        ref={props.innerRef}
                        {...props.draggableProps}
                        {...props.dragHandleProps}
                        key={index}
                        sx={TabStyle(index, selectedTimetable)}
                        onClick={() => handleSwitchTimetables(displayTimetables, index)}
                        onContextMenu={(e) => handleRightTabClick(e, index)}>
                        {timetable.name}
                        {
                          selectedTimetable === index ? (
                            <StyledSpan onClick={handleMenuClick}>
                              <MoreHoriz />
                            </StyledSpan>
                          ) : (
                            <></>
                          )
                        }
                      </Box>
                    )}
                  </Draggable>
                ))}
                {props.placeholder}
              </StyledTabs>
            )}
          </Droppable>
        </DragDropContext>
        <TimetableTabContextMenu anchorElement={anchorElement} setAnchorElement={setAnchorElement} />
        <Tooltip title={addTimetabletip}>
          <StyledIconButton
            tabTheme={tabTheme}
            id="create-timetables-button"
            onClick={handleCreateTimetable}
          >
            <AddIcon />
          </StyledIconButton>
        </Tooltip>
      </TabsWrapper >
    </TabsSection >
  );
};
export { TimetableTabs };
