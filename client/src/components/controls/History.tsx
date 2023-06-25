import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redo, Delete, Undo } from '@mui/icons-material';
import { IconButton, Tooltip, Dialog, Button, Box, styled } from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { StyledDialogContent, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import { CourseData, CreatedEvents, SelectedClasses, TimetableData } from '../../interfaces/Periods';
import {
  duplicateClasses,
  areIdenticalTimetables,
  extractHistoryInfo,
  createDefaultTimetable,
  TimetableActions,
  ActionsPointer,
} from '../../utils/timetableHelpers';

// Two actions are created when the page first loads
// One, when selectedClasses is initialised, and two, when createdEvents is initialised
const initialIndex = 1;
const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

const History: React.FC = () => {
  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(true);
  const [disableReset, setDisableReset] = useState({ current: true, all: true });
  const [clearOpen, setClearOpen] = useState(false);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);
  const { isDrag, setIsDrag, selectedTimetable, setSelectedTimetable, displayTimetables, setDisplayTimetables } =
    useContext(AppContext);

  const timetableActions = useRef<TimetableActions>({});
  const actionsPointer = useRef<ActionsPointer>({});

  const dontAdd = useRef(false);
  const isMounted = useRef(false); //prevents reset timetable disabling on initial render

  const StyledDialogButtons = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    padding-bottom: 5px;
    padding-right: 5px;
  `;

  const setTimetableState = (
    courses: CourseData[],
    classes: SelectedClasses,
    events: CreatedEvents,
    timetableArg: TimetableData[] | ((prev: TimetableData[]) => void),
    selected?: number
  ) => {
    setSelectedCourses(courses);
    setSelectedClasses(classes);
    setCreatedEvents(events);
    setDisplayTimetables(timetableArg);

    if (selected !== undefined) {
      setSelectedTimetable(selected);
    }
  };

  /**
   * Update the index of the current action
   * @param direction Which way to update (1 for increment, -1 for decrement)
   */
  const incrementActionsPointer = (direction: number) => {
    const timetableId = displayTimetables[selectedTimetable].id;
    actionsPointer.current[timetableId] += direction;
    setDisableLeft(actionsPointer.current[timetableId] < 1);
    setDisableRight(actionsPointer.current[timetableId] + 1 >= timetableActions.current[timetableId].length);
  };

  // Adds an action when a class is changed/added/removed, an event is created/removed
  // or a card is dragged to another place
  useEffect(() => {
    if (isDrag) return;

    if (dontAdd.current) {
      dontAdd.current = false;
      return; // Prevents adding change induced by clicking redo/undo
    }

    if (selectedTimetable >= displayTimetables.length) {
      return;
    }

    const currentTimetable = displayTimetables[selectedTimetable];

    // Create object if it doesn't exist
    if (!timetableActions.current[currentTimetable.id]) {
      timetableActions.current[currentTimetable.id] = [];
      actionsPointer.current[currentTimetable.id] = -initialIndex;
    }

    const currentActions = timetableActions.current[currentTimetable.id];
    const currentPointer = actionsPointer.current[currentTimetable.id];
    if (areIdenticalTimetables(currentActions, currentPointer, selectedClasses, createdEvents, currentTimetable)) {
      return;
    }

    // Discard remaining redos as we branched off by making an action
    if (currentActions.length > currentPointer + 1) {
      timetableActions.current[currentTimetable.id] = currentActions.slice(0, currentPointer + 1);
    }

    currentActions.push({
      name: displayTimetables[selectedTimetable].name,
      courses: [...selectedCourses],
      classes: duplicateClasses(selectedClasses),
      events: { ...createdEvents },
    });

    incrementActionsPointer(1);
  }, [selectedClasses, isDrag, createdEvents, displayTimetables]);

  //Disables reset timetable button when there is no courses, classes and events selected.
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const disableStatus = { current: true, all: true };

    // More than one timetable is resetAll-able
    if (displayTimetables.length > 1) {
      disableStatus.all = false;
    }

    // Current timetable being non-empty is resetAll and resetOne-able
    const currentTimetable = displayTimetables[selectedTimetable];
    // if new timetable has been created then set reset to be true since no courses, classes or events selected
    if (actionsPointer.current[currentTimetable.id] < 1) {
      disableStatus.current = true;
    } else {
      const nCourses = selectedCourses.length;
      const nEvents = Object.values(createdEvents).length;
      const nClasses = Object.values(selectedClasses).length;

      disableStatus.current = nCourses === 0 && nEvents === 0 && nClasses === 0;
      disableStatus.all = nCourses === 0 && nEvents === 0 && nClasses === 0;

      // If only name is different to default, than still reset-allable but not reset-oneable
      if (currentTimetable.name !== 'My timetable') {
        disableStatus.all = false;
      }

      // If there is history attached to the single timetable, then we can reset everything as well
      if (timetableActions.current[currentTimetable.id].length > 1) {
        disableStatus.all = false;
      }
    }
    setDisableReset(disableStatus);
  }, [selectedTimetable, selectedCourses, selectedClasses, createdEvents, displayTimetables]);

  useEffect(() => {
    if (displayTimetables.length < 1) {
      return;
    }

    const timetableId = displayTimetables[selectedTimetable].id;
    const currentPointer = actionsPointer.current[timetableId];
    setDisableLeft(currentPointer === undefined || currentPointer < 1);
    setDisableRight(currentPointer === undefined || currentPointer + 1 >= timetableActions.current[timetableId].length);
  }, [selectedTimetable]);

  /**
   * Updates the index of the current action and changes the timetable data to match
   * @param direction Which way to move (1 for increment, -1 for decrement)
   */
  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;

    const timetableId = displayTimetables[selectedTimetable].id;
    const modifyTimetableName = (prev: TimetableData[]) => {
      return prev.map((timetable) => {
        return timetable.id === timetableId
          ? { ...timetable, name: timetableActions.current[timetableId][actionsPointer.current[timetableId]].name }
          : timetable;
      });
    };

    const { courses, classes, events } = extractHistoryInfo(timetableId, timetableActions.current, actionsPointer.current);
    setTimetableState(courses, classes, events, modifyTimetableName);
  };

  /**
   * Resets all timetables - leave one default
   */
  const clearAll = () => {
    setTimetableState([], {}, {}, createDefaultTimetable(), 0);
  };

  /**
   * Undo/redo accordingly when a hotkey is pressed
   * @param event The keyboard event that was triggered
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // event.metaKey corresponds to the Cmd key on Mac
    if (!(event.ctrlKey || event.metaKey) || !(event.key === 'z' || event.key === 'y' || event.key === 'd')) return;

    const currentTimetable = displayTimetables[selectedTimetable];

    event.preventDefault();

    if (!isMacOS && event.ctrlKey) {
      if (event.key === 'z' && !disableLeft && actionsPointer.current[currentTimetable.id] > 1) {
        changeHistory(-1);
      }
      if (
        event.key === 'y' &&
        !disableRight &&
        actionsPointer.current[currentTimetable.id] + 1 < timetableActions.current[currentTimetable.id].length
      ) {
        changeHistory(1);
      }
      if (event.key === 'd') {
        setClearOpen((prev) => !prev);
      }
    }

    if (isMacOS && event.metaKey) {
      if (!event.shiftKey &&
        event.key === 'z' &&
        !disableLeft &&
        actionsPointer.current[currentTimetable.id] > 1
      ) {
        changeHistory(-1);
      }
      if (
        event.shiftKey &&
        event.key === 'z' &&
        !disableRight &&
        actionsPointer.current[currentTimetable.id] + 1 < timetableActions.current[currentTimetable.id].length
      ) {
        changeHistory(1);
      }
      if (event.key === 'd') {
        setClearOpen((prev) => !prev);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', () => setIsDrag(false)); // Only triggers useEffect function if isDrag was true previously
  }, [disableLeft, disableRight]);

  let clearTooltip = isMacOS ? 'Clear (Cmd+D)' : 'Clear (Ctrl+D)';
  let undoTooltip = isMacOS ? 'Undo (Cmd+Z)' : 'Undo (Ctrl+Z)';
  let redoTooltip = isMacOS ? 'Redo (Cmd+Shift+Z)' : 'Redo (Ctrl+Y)';

  return (
    <>
      {/* Clear timetable(s) Dialog  */}
      <Dialog maxWidth="xs" onClose={() => setClearOpen(false)} open={clearOpen}>
        <StyledTitleContainer>
          <StyledDialogContent>Clear all timetables?</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button
            disabled={disableReset.all}
            onClick={() => {
              setClearOpen(false);
            }}
          >
            CANCEL
          </Button>
          <Button
            disabled={disableReset.current}
            onClick={() => {
              clearAll();
              setClearOpen(false);
            }}
          >
            CLEAR
          </Button>
        </StyledDialogButtons>
      </Dialog>
      <Tooltip title={clearTooltip}>
        <IconButton
          disabled={disableReset.all && disableReset.current}
          color="inherit"
          onClick={() => setClearOpen(true)}
          size="large"
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={undoTooltip}>
        <span>
          <IconButton disabled={disableLeft} color="inherit" onClick={() => changeHistory(-1)} size="large">
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={redoTooltip}>
        <span>
          <IconButton disabled={disableRight} color="inherit" onClick={() => changeHistory(1)} size="large">
            <Redo />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export default History;
