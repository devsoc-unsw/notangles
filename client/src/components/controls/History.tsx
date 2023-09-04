import { Delete, Redo, Undo } from '@mui/icons-material';
import { Button, Dialog, IconButton, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { CourseData, CreatedEvents, SelectedClasses, TimetableData } from '../../interfaces/Periods';
import { StyledDialogButtons, StyledDialogContent, StyledTitleContainer } from '../../styles/ControlStyles';
import {
  ActionsPointer,
  areIdenticalTimetables,
  createDefaultTimetable,
  duplicateClasses,
  extractHistoryInfo,
  TimetableActions,
} from '../../utils/timetableHelpers';

// Two actions are created when the page first loads
// One, when selectedClasses is initialised, and two, when createdEvents is initialised
const initialIndex = 1;
const isMacOS = navigator.userAgent.indexOf('Mac') != -1;

const History: React.FC = () => {
  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(true);
  const [disableDelete, setDisableDelete] = useState(true);
  const [clearOpen, setClearOpen] = useState(false);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);
  const { isDrag, setIsDrag, selectedTimetable, setSelectedTimetable, displayTimetables, setDisplayTimetables } =
    useContext(AppContext);

  const timetableActions = useRef<TimetableActions>({});
  const actionsPointer = useRef<ActionsPointer>({});

  const dontAdd = useRef(false);
  const isMounted = useRef(false); //prevents reset timetable disabling on initial render

  const setTimetableState = (
    courses: CourseData[],
    classes: SelectedClasses,
    events: CreatedEvents,
    timetableArg: TimetableData[] | ((prev: TimetableData[]) => void),
    selected?: number,
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

  // Disable delete button and its keyboard shortcut iff there is only one timetable
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    setDisableDelete(!(displayTimetables.length > 1));
  }, [displayTimetables]);

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

    const { courses, classes, events } = extractHistoryInfo(
      timetableId,
      timetableActions.current,
      actionsPointer.current,
    );
    setTimetableState(courses, classes, events, modifyTimetableName);
  };

  /**
   * Resets all timetables - leave one as default
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

    // For Windows
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
        setClearOpen(true);
      }
    }

    // For Mac
    if (isMacOS && event.metaKey) {
      if (!event.shiftKey && event.key === 'z' && !disableLeft && actionsPointer.current[currentTimetable.id] > 1) {
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
        setClearOpen(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', () => setIsDrag(false)); // Only triggers useEffect function if isDrag was true previously
  }, [disableLeft, disableRight]);

  // Hotkey to confirm delete all timetables by pressing enter button
  useEffect(() => {
    const handleDeleteEnterShortcut = (event: KeyboardEvent) => {
      const deleteConfirm = document.getElementById('confirm-delete-button');
      if (clearOpen && event.key === 'Enter') {
        event.preventDefault();
        deleteConfirm?.focus();
        deleteConfirm?.click();
      }
    };

    document.addEventListener('keydown', handleDeleteEnterShortcut);

    // Removing the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDeleteEnterShortcut);
    };
  }, [clearOpen]);

  const clearTooltip = isMacOS ? 'Clear (Cmd+D)' : 'Clear (Ctrl+D)';
  const undoTooltip = isMacOS ? 'Undo (Cmd+Z)' : 'Undo (Ctrl+Z)';
  const redoTooltip = isMacOS ? 'Redo (Cmd+Shift+Z)' : 'Redo (Ctrl+Y)';

  return (
    <>
      {/* Clear timetable(s) Dialog  */}
      <Dialog maxWidth="xs" onClose={() => setClearOpen(false)} open={clearOpen}>
        <StyledTitleContainer>
          <StyledDialogContent>Clear all timetables?</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button
            onClick={() => {
              setClearOpen(false);
            }}
          >
            CANCEL
          </Button>
          <Button
            disabled={disableDelete}
            id="confirm-delete-button"
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
        <IconButton disabled={disableDelete} color="inherit" onClick={() => setClearOpen(true)} size="large">
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
