import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Add, MoreHoriz, Star } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Term } from '../../../api/times/times';
import { useCreateTimetable } from '../../../api/timetable/mutations';
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

// TODO: Enforce this in the backend
const TIMETABLE_LIMIT = 5; // Per term

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

  const isMacOS = navigator.userAgent.includes('Mac');
  // TODO: Implement shortcut
  const addTimetableTip = isMacOS ? 'New Tab (Cmd+Enter)' : 'New Tab (Ctrl+Enter)';

  const timetableIds = useTimetableIdsQuery(term);
  const timetables = useTimetableInfoQueries(timetableIds);

  const queryClient = useQueryClient();
  const createTimetableMutation = useCreateTimetable(queryClient);

  return (
    <TabsSection>
      <TabsWrapper tabTheme={tabTheme} id="tabs-wrapper">
        <DragDropContext
          onDragEnd={() => {
            // TODO: Implement
          }}
        >
          <Droppable droppableId="tabs" direction="horizontal">
            {(props) => (
              <StyledTabs ref={props.innerRef} {...props.droppableProps}>
                {timetables.map((timetable, index) => (
                  <Draggable draggableId={timetable.id} key={timetable.id} index={index}>
                    {(props) => {
                      // TODO: What does this do?
                      // if (props.draggableProps.style?.transform) {
                      //   const horizShift = props.draggableProps.style?.transform.match(/(-?\d+)/g)?.map(Number)![0];
                      //   // forcing horizontal movement
                      //   props.draggableProps.style.transform = `translate(${horizShift ? horizShift : 0}px, 0)`;
                      // }
                      return (
                        <Box
                          onMouseDown={() => {
                            selectTimetableId(timetable.id);
                          }}
                          // onContextMenu
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
                            <StyledSpan
                            // onClick
                            >
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
              </StyledTabs>
            )}
          </Droppable>
        </DragDropContext>
        {/* <TimetableTabContextMenu anchorElement={anchorElement} setAnchorElement={setAnchorElement} /> */}
        <Tooltip title={addTimetableTip}>
          <StyledIconButton
            tabTheme={tabTheme}
            id="create-timetables-button"
            onClick={() => {
              if (timetableIds.length >= TIMETABLE_LIMIT) {
                // TODO: Handle alerts properly
                alert(`You have reached the limit of ${TIMETABLE_LIMIT} timetables per term.`);
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
