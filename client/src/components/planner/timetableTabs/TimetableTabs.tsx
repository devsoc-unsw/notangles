import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Add, MoreHoriz, Star } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';

import { Term } from '../../../api/times/times';
import { useCreateTimetable, useReorderTimetables } from '../../../api/timetable/mutations';
import { useTimetableIdsQuery, useTimetableInfoQueries } from '../../../api/timetable/queries';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { darkTheme, lightTheme } from '../../../constants/theme';
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
} from '../../../styles/TimetableTabStyles';
import TimetableTabContextMenu from './TimetableTabContextMenu';

const TIMETABLE_LIMIT = 5; // Per term, enforced on the backend too

const TimetableTabs: React.FC<{ term: Term; selectedTimetableId: string; selectTimetableId: (id: string) => void }> = ({
  term,
  selectedTimetableId,
  selectTimetableId,
}) => {
  const { isDarkMode, preferredTheme } = useGetUserSettingsQuery();
  const themeObject = useMemo(
    () => (isDarkMode ? darkTheme(preferredTheme) : lightTheme(preferredTheme)),
    [isDarkMode, preferredTheme],
  );
  const tabTheme: TabTheme = useMemo(() => {
    return isDarkMode ? tabThemeDark : tabThemeLight;
  }, [isDarkMode]);
  const { TabStyle } = useMemo(() => createTimetableStyle(tabTheme, themeObject), [tabTheme, themeObject]);

  const [anchorElement, setAnchorElement] = useState<null | { x: number; y: number }>(null);

  const isMacOS = navigator.userAgent.includes('Mac');
  // TODO: Implement shortcut
  const addTimetableTip = isMacOS ? 'New Tab (Cmd+Enter)' : 'New Tab (Ctrl+Enter)';

  const timetableIds = useTimetableIdsQuery(term);
  const timetables = useTimetableInfoQueries(timetableIds);

  const createTimetableMutation = useCreateTimetable();
  const reorderTimetablesMutation = useReorderTimetables(String(term.year), term.term);

  /**
   * Dropdown menu tab handlers
   */
  // Left click handler for the three dots icon (editing the timetable tab)
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorElement({ x: e.clientX, y: e.clientY });
  };

  // Right clicking a tab will switch to that tab and open the menu
  const handleRightTabClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    // Anchoring the menu to the mouse position
    setAnchorElement({ x: e.clientX, y: e.clientY });
  };

  return (
    <TabsSection>
      <TabsWrapper tabTheme={tabTheme} id="tabs-wrapper">
        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination || result.destination.index === result.source.index) return;
            const reordered = [...timetableIds];
            const [moved] = reordered.splice(result.source.index, 1);
            reordered.splice(result.destination.index, 0, moved);
            reorderTimetablesMutation.mutate(reordered);
          }}
        >
          <Droppable droppableId="tabs" direction="horizontal">
            {(props) => (
              <StyledTabs ref={props.innerRef} {...props.droppableProps}>
                {timetables.map((timetable, index) => (
                  <Draggable draggableId={timetable.id} key={timetable.id} index={index}>
                    {(props) => {
                      // TODO: What does this do?
                      if (props.draggableProps.style?.transform) {
                        const horizShift = props.draggableProps.style.transform.match(/(-?\d+)/g)?.map(Number)[0];
                        // forcing horizontal movement
                        props.draggableProps.style.transform = `translate(${String(horizShift ?? 0)}px, 0)`;
                      }
                      return (
                        <Box
                          onMouseDown={() => {
                            selectTimetableId(timetable.id);
                          }}
                          onContextMenu={handleRightTabClick}
                          ref={props.innerRef}
                          {...props.draggableProps}
                          {...props.dragHandleProps}
                          sx={TabStyle(index, selectedTimetableId === timetable.id)}
                        >
                          {timetable.primary && (
                            <Tooltip title="A primary timetable is the timetable for social features.">
                              <Star fontSize="small" className="pr-1.5"></Star>
                            </Tooltip>
                          )}
                          {timetable.name}
                          {selectedTimetableId === timetable.id ? (
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
                ))}
                {props.placeholder}
              </StyledTabs>
            )}
          </Droppable>
        </DragDropContext>
        <TimetableTabContextMenu
          anchorElement={anchorElement}
          setAnchorElement={setAnchorElement}
          selectedTimetableId={selectedTimetableId}
          selectTimetableId={selectTimetableId}
          term={term}
        />
        <Tooltip title={addTimetableTip}>
          <StyledIconButton
            tabTheme={tabTheme}
            id="create-timetables-button"
            onClick={() => {
              if (timetableIds.length >= TIMETABLE_LIMIT) {
                // TODO: Handle alerts properly
                alert(`You have reached the limit of ${String(TIMETABLE_LIMIT)} timetables per term.`);
                return;
              }

              createTimetableMutation.mutate({
                name: 'New Timetable',
                year: term.year,
                term: term.term,
                onSuccess: selectTimetableId,
              });
            }}
          >
            <Add />
          </StyledIconButton>
        </Tooltip>
      </TabsWrapper>
    </TabsSection>
  );
};

export default TimetableTabs;
