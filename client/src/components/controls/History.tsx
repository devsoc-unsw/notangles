import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redo, Delete, Undo } from '@mui/icons-material';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogActions, Button, Box, Tab, styled } from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { StyledTabPanel } from '../../styles/CustomEventStyles';
import { TabContext, TabList } from '@mui/lab';
import { StyledDialogContent, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import {
  Action,
  Activity,
  ClassData,
  CreatedEvents,
  EventTime,
  InInventory,
  SelectedClasses,
  TimetableData,
} from '../../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';

type TimetableActions = Record<string, Action[]>;
type ActionsPointer = Record<string, number>;

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

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };


  const StyledDialogButtons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 5px;
  padding-right: 5px;
`;


  /**
   * @param selectedClasses The currently selected classes
   * @returns A deep copy of the currently selected classes
   */
  const duplicateClasses = (selectedClasses: SelectedClasses) => {
    const newClasses: SelectedClasses = {};

    Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
      const newActivityCopy: Record<Activity, ClassData | InInventory> = {};

      Object.entries(activities).forEach(([activity, classData]) => {
        newActivityCopy[activity] = classData !== null ? { ...classData } : null;
      });
      newClasses[courseCode] = { ...newActivityCopy };
    });

    return newClasses;
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

  /**
   * @param curr The current action's selected classes
   * @param next The new selected classes
   * @returns Whether curr and next are equal
   */
  const areIdenticalClasses = (curr: SelectedClasses, next: SelectedClasses) => {
    const cVals = Object.values(curr);
    const nVals = Object.values(next);
    if (cVals.length !== nVals.length) {
      return false;
    }

    for (let i = 0; i < cVals.length; i++) {
      const currClassData = Object.values(cVals[i]);
      const nextClassData = Object.values(nVals[i]);
      if (currClassData.length !== nextClassData.length) {
        return false;
      }

      for (let j = 0; j < currClassData.length; j++) {
        if (!currClassData[j] !== !nextClassData[j]) {
          return false;
        } // If exactly one is null
        if (currClassData[j]?.id !== nextClassData[j]?.id) {
          return false;
        }
      }
    }

    return true;
  };

  /**
   * @param curr The current action's created events
   * @param next The new created events
   * @returns Whether curr and next are equal
   */
  const areIdenticalEvents = (curr: CreatedEvents, next: CreatedEvents) => {
    const sameTime = (a: EventTime, b: EventTime) => a.day === b.day && a.start === b.start && a.end === b.end;

    const currEvents = Object.values(curr);
    const nextEvents = Object.values(next);
    if (currEvents.length !== nextEvents.length) {
      return false;
    }

    for (let i = 0; i < currEvents.length; i++) {
      if (!sameTime(currEvents[i].time, nextEvents[i].time)) {
        return false;
      }
    }

    return true;
  };

  // Adds an action when a class is changed/added/removed, an event is created/removed
  // or a card is dragged to another place
  useEffect(() => {
    if (isDrag) return;

    if (dontAdd.current) {
      dontAdd.current = false;
      return; // Prevents adding change induced by clicking redo/undo
    }

    if (displayTimetables.length === 0) {
      return;
    }

    const currentTimetable = displayTimetables[selectedTimetable];
    // Create object if it doesn't exist
    if (!timetableActions.current[currentTimetable.id]) {
      timetableActions.current[currentTimetable.id] = [];
      actionsPointer.current[currentTimetable.id] = -initialIndex;
    }

    if (
      timetableActions.current[currentTimetable.id].length > 0 &&
      areIdenticalClasses(
        timetableActions.current[currentTimetable.id][actionsPointer.current[currentTimetable.id]].classes,
        selectedClasses
      ) &&
      areIdenticalEvents(
        timetableActions.current[currentTimetable.id][actionsPointer.current[currentTimetable.id]].events,
        createdEvents
      ) &&
      timetableActions.current[currentTimetable.id][actionsPointer.current[currentTimetable.id]].name ===
      displayTimetables[selectedTimetable].name
    ) {
      return;
    }

    // Discard remaining redos as we branched off by making an action
    if (timetableActions.current[currentTimetable.id].length > actionsPointer.current[currentTimetable.id] + 1) {
      timetableActions.current[currentTimetable.id] = timetableActions.current[currentTimetable.id].slice(
        0,
        actionsPointer.current[currentTimetable.id] + 1
      );
    }

    timetableActions.current[currentTimetable.id].push({
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
    setDisableLeft(actionsPointer.current[timetableId] === undefined || actionsPointer.current[timetableId] < 1);
    setDisableRight(
      actionsPointer.current[timetableId] === undefined ||
      actionsPointer.current[timetableId] + 1 >= timetableActions.current[timetableId].length
    );
  }, [selectedTimetable]);

  /**
   * Updates the index of the current action and changes the timetable data to match
   * @param direction Which way to move (1 for increment, -1 for decrement)
   */
  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;

    const timetableId = displayTimetables[selectedTimetable].id;
    setDisplayTimetables((prev: TimetableData[]) => {
      return prev.map((timetable) => {
        return timetable.id === timetableId
          ? { ...timetable, name: timetableActions.current[timetableId][actionsPointer.current[timetableId]].name }
          : timetable;
      });
    });
    setSelectedCourses(timetableActions.current[timetableId][actionsPointer.current[timetableId]].courses);
    setSelectedClasses(duplicateClasses(timetableActions.current[timetableId][actionsPointer.current[timetableId]].classes)); // Very important to duplicate here again or things will break
    setCreatedEvents(timetableActions.current[timetableId][actionsPointer.current[timetableId]].events);
  };

  /**
   * Resets all timetables - leave one default
   */
  const clearAll = () => {
    setSelectedCourses([]);
    setSelectedClasses({});
    setCreatedEvents({});

    setSelectedTimetable(0);
    setDisplayTimetables([
      {
        name: 'My timetable',
        id: uuidv4(),
        selectedCourses: [],
        selectedClasses: {},
        createdEvents: {},
      },
    ]);
  };

  /**
   * Reset current timetable and selected courses to be completely empty
   */
  const clearOne = () => {
    setSelectedCourses([]);
    setSelectedClasses({});
    setCreatedEvents({});

    setDisplayTimetables((prev: TimetableData[]) => {
      const newArray = [...prev];
      newArray[selectedTimetable] = {
        ...newArray[selectedTimetable],
        selectedCourses: [],
        selectedClasses: {},
        createdEvents: {},
      };
      return newArray;
    });
  };

  /**
   * Undo/redo accordingly when a hotkey is pressed
   * @param event The keyboard event that was triggered
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // event.metaKey corresponds to the Cmd key on Mac
    if (!(event.ctrlKey || event.metaKey) || !(event.key === 'z' || event.key === 'y' || event.key === 'd')) return;

    event.preventDefault();

    if (!isMacOS && event.ctrlKey) {
      if (event.key === 'z' && actionsPointer.current[selectedTimetable] > 1) {
        changeHistory(-1);
      }
      if (
        event.key === 'y' &&
        actionsPointer.current[selectedTimetable] + 1 < timetableActions.current[selectedTimetable].length
      ) {
        changeHistory(1);
      }
      if (event.key === 'd') {
        setClearOpen((prev) => !prev);
      }
    }

    if (isMacOS && event.metaKey) {
      if (!event.shiftKey && event.key === 'z' && actionsPointer.current[selectedTimetable] > 1) {
        changeHistory(-1);
      }
      if (
        event.shiftKey &&
        event.key === 'z' &&
        actionsPointer.current[selectedTimetable] + 1 < timetableActions.current[selectedTimetable].length
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
  }, []);

  let clearTooltip = isMacOS ? 'Clear (Cmd+D)' : 'Clear (Ctrl+D)';
  let undoTooltip = isMacOS ? 'Undo (Cmd+Z)' : 'Undo (Ctrl+Z)';
  let redoTooltip = isMacOS ? 'Redo (Cmd+Shift+Z)' : 'Redo (Ctrl+Y)';

  return (
    <>
      {/* Clear timetable(s) Dialog  */}
      <Dialog maxWidth="xs" onClose={() => setClearOpen(false)} open={clearOpen}>
        <StyledTitleContainer>
          <StyledDialogContent>Clear timetable data?</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button onClick={() => {
            clearAll();
            setClearOpen(false);
          }}>All</Button>
          <Button
            onClick={() => {
              clearOne();
              setClearOpen(false);
            }}
          >
            Current
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
