import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Add, MoreHoriz, Star } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useGetUserSettingsQuery } from '../../api/user/queries';
import { darkTheme, lightTheme } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { NewData, NewTimetableData } from '../../interfaces/Periods';
import {
  createTimetableStyle,
  StyledIconButton,
  StyledSpan,
  StyledTabs,
  TabsSection,
  TabsWrapper,
  TabTheme,
  tabThemeDark,
  tabThemeLight,
} from '../../styles/TimetableTabStyles';
import TimetableTabContextMenu from './TimetableTabContextMenu';

const TimetableTabs: React.FC = () => {
  const TIMETABLE_LIMIT = 13;

  const {
    timetableIds,
    setTimetableIds,
    timetables,
    setTimetables,
    selectedTimetableId,
    setSelectedTimetableId,
    setAlertMsg,
    setErrorVisibility,
  } = useContext(AppContext);

  const { isDarkMode, preferredTheme } = useGetUserSettingsQuery();

  const [anchorElement, setAnchorElement] = useState<null | { x: number; y: number }>(null);

  const isMacOS = navigator.userAgent.includes('Mac');

  const addTimetabletip = isMacOS ? 'New Tab (Cmd+Enter)' : 'New Tab (Ctrl+Enter)';

  const themeObject = useMemo(
    () => (isDarkMode ? darkTheme(preferredTheme) : lightTheme(preferredTheme)),
    [isDarkMode, preferredTheme],
  );

  const tabTheme: TabTheme = useMemo(() => {
    return isDarkMode ? tabThemeDark : tabThemeLight;
  }, [isDarkMode]);

  const { TabStyle } = useMemo(() => createTimetableStyle(tabTheme, themeObject), [tabTheme, themeObject]);

  /**
   * Timetable handlers
   */
  // Creates new timetable
  const handleCreateTimetable = () => {
    if (timetableIds.length >= TIMETABLE_LIMIT) {
      setAlertMsg('Maximum timetables reached');
      setErrorVisibility(true);
    } else {
      const id = uuidv4();
      const newTimetable: Record<string, NewTimetableData> = {
        [id]: { name: 'New Timetable', primary: false, courseIds: [] },
      };
      const newTimetableIds = [...timetableIds, ...Object.keys(newTimetable)];
      const newTimetables = { ...timetables, ...newTimetable };
      setTimetableIds(newTimetableIds);
      setTimetables(newTimetables);

      localStorage.setItem(
        'newData',
        JSON.stringify({
          timetableIds: newTimetableIds,
          timetables: newTimetables,
          selectedTimetableId: id,
        } as NewData),
      );
      setSelectedTimetableId(Object.keys(newTimetable)[0]);
    }
  };

  /**
   * Drag and drop functions for rearranging timetable tabs
   */
  // Handles timetable switching by updating the selected courses, classes and events to the new timetable
  const handleSwitchTimetables = (ids: string[], index: number) => {
    const id = ids[index];
    if (!id) return;
    setSelectedTimetableId(id);
    localStorage.setItem(
      'newData',
      JSON.stringify({
        timetableIds: ids,
        timetables: timetables,
        selectedTimetableId: id,
      } as NewData),
    );
  };

  // Reordering the tabs when they are dragged and dropped
  const handleSortTabs = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newOrder = Array.from(timetableIds);
    const [moved] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, moved);

    setTimetableIds(newOrder);

    localStorage.setItem(
      'newData',
      JSON.stringify({
        timetableIds: newOrder,
        timetables: timetables,
        selectedTimetableId: selectedTimetableId,
      } as NewData),
    );
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
    handleSwitchTimetables(timetableIds, index);

    // Anchoring the menu to the mouse position
    setAnchorElement({ x: event.clientX, y: event.clientY });
  };

  return (
    <TabsSection>
      <TabsWrapper tabTheme={tabTheme} id="tabs-wrapper">
        <DragDropContext onDragEnd={handleSortTabs}>
          <Droppable droppableId="tabs" direction="horizontal">
            {(props) => (
              <StyledTabs ref={props.innerRef} {...props.droppableProps}>
                {timetableIds.length > 0
                  ? timetableIds.map((id: string, index) => (
                      <Draggable draggableId={id} index={index} key={id}>
                        {(props) => {
                          if (props.draggableProps.style?.transform) {
                            const horizShift = props.draggableProps.style.transform.match(/(-?\d+)/g)?.map(Number)[0];
                            // forcing horizontal movement
                            props.draggableProps.style.transform = `translate(${String(horizShift ?? 0)}px, 0)`;
                          }
                          return (
                            <Box
                              onMouseDown={() => {
                                handleSwitchTimetables(timetableIds, index);
                              }}
                              onContextMenu={(e) => {
                                handleRightTabClick(e, index);
                              }}
                              ref={props.innerRef}
                              {...props.draggableProps}
                              {...props.dragHandleProps}
                              sx={TabStyle(index, id, selectedTimetableId)}
                            >
                              {timetables[id].primary && (
                                <Tooltip title="A primary timetable is the timetable for social features.">
                                  <Star fontSize="small" className="pr-1.5"></Star>
                                </Tooltip>
                              )}
                              {timetables[id].name}
                              {selectedTimetableId === id ? (
                                <StyledSpan onClick={handleMenuClick}>
                                  <MoreHoriz />
                                </StyledSpan>
                              ) : (
                                <></>
                              )}
                            </Box>
                          );
                        }}
                      </Draggable>
                    ))
                  : null}
                {props.placeholder}
              </StyledTabs>
            )}
          </Droppable>
        </DragDropContext>
        <TimetableTabContextMenu anchorElement={anchorElement} setAnchorElement={setAnchorElement} />
        <Tooltip title={addTimetabletip}>
          <StyledIconButton tabTheme={tabTheme} id="create-timetables-button" onClick={handleCreateTimetable}>
            <Add />
          </StyledIconButton>
        </Tooltip>
      </TabsWrapper>
    </TabsSection>
  );
};
export { TimetableTabs };
