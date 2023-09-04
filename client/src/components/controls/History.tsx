import { Delete, Redo, Undo } from '@mui/icons-material';
import { Button, Dialog, IconButton, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
<<<<<<< HEAD
import { Redo, Delete, Undo } from '@mui/icons-material';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogActions, Button, Box, Tab } from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { StyledTabPanel } from '../../styles/CustomEventStyles';
import { TabContext, TabList } from '@mui/lab';
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
=======

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
>>>>>>> dev

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

<<<<<<< HEAD
  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

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
=======
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
>>>>>>> dev
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
<<<<<<< HEAD
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
=======
>>>>>>> dev
  };

  // Adds an action when a class is changed/added/removed, an event is created/removed
  // or a card is dragged to another place
  useEffect(() => {
    if (isDrag) return;

    if (dontAdd.current) {
      dontAdd.current = false;
      return; // Prevents adding change induced by clicking redo/undo
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> dev
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
<<<<<<< HEAD

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

=======

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

>>>>>>> dev
  useEffect(() => {
    if (displayTimetables.length < 1) {
      return;
    }

    const timetableId = displayTimetables[selectedTimetable].id;
<<<<<<< HEAD
    setDisableLeft(actionsPointer.current[timetableId] === undefined || actionsPointer.current[timetableId] < 1);
    setDisableRight(
      actionsPointer.current[timetableId] === undefined ||
      actionsPointer.current[timetableId] + 1 >= timetableActions.current[timetableId].length
    );
=======
    const currentPointer = actionsPointer.current[timetableId];
    setDisableLeft(currentPointer === undefined || currentPointer < 1);
    setDisableRight(currentPointer === undefined || currentPointer + 1 >= timetableActions.current[timetableId].length);
>>>>>>> dev
  }, [selectedTimetable]);

  /**
   * Updates the index of the current action and changes the timetable data to match
   * @param direction Which way to move (1 for increment, -1 for decrement)
   */
  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;

    const timetableId = displayTimetables[selectedTimetable].id;
<<<<<<< HEAD
    setDisplayTimetables((prev: TimetableData[]) => {
=======
    const modifyTimetableName = (prev: TimetableData[]) => {
>>>>>>> dev
      return prev.map((timetable) => {
        return timetable.id === timetableId
          ? { ...timetable, name: timetableActions.current[timetableId][actionsPointer.current[timetableId]].name }
          : timetable;
      });
<<<<<<< HEAD
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
=======
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
>>>>>>> dev
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
<<<<<<< HEAD
      if (event.key === 'z' && actionsPointer.current[selectedTimetable] > 1) {
=======
      if (event.key === 'z' && !disableLeft && actionsPointer.current[currentTimetable.id] > 1) {
>>>>>>> dev
        changeHistory(-1);
      }
      if (
        event.key === 'y' &&
<<<<<<< HEAD
        actionsPointer.current[selectedTimetable] + 1 < timetableActions.current[selectedTimetable].length
=======
        !disableRight &&
        actionsPointer.current[currentTimetable.id] + 1 < timetableActions.current[currentTimetable.id].length
>>>>>>> dev
      ) {
        changeHistory(1);
      }
      if (event.key === 'd') {
        setClearOpen((prev) => !prev);
      }
    }

    if (isMacOS && event.metaKey) {
<<<<<<< HEAD
      if (!event.shiftKey && event.key === 'z' && actionsPointer.current[selectedTimetable] > 1) {
=======
      if (!event.shiftKey && event.key === 'z' && !disableLeft && actionsPointer.current[currentTimetable.id] > 1) {
>>>>>>> dev
        changeHistory(-1);
      }
      if (
        event.shiftKey &&
        event.key === 'z' &&
<<<<<<< HEAD
        actionsPointer.current[selectedTimetable] + 1 < timetableActions.current[selectedTimetable].length
=======
        !disableRight &&
        actionsPointer.current[currentTimetable.id] + 1 < timetableActions.current[currentTimetable.id].length
>>>>>>> dev
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
<<<<<<< HEAD
      <Dialog onClose={() => setClearOpen(false)} open={clearOpen}>
        <TabContext value={"Clear Timetables"}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList centered>
              <Tab label="Clear Timetables" value="Clear Timetables" />
            </TabList>
          </Box>
          <StyledTabPanel value="Clear Timetables">
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button
                id="clear-current-button"
                sx={ModalButtonStyle}
                variant="contained"
                disabled={disableReset.current}
                onClick={() => {
                  clearOne();
                  setClearOpen(false);
                }}
              >
                Current
              </Button>
              <Button
                id="clear-all-button"
                sx={ModalButtonStyle}
                variant="contained"
                disabled={disableReset.all}
                onClick={() => {
                  clearAll();
                  setClearOpen(false);
                }}
              >
                All
              </Button>
            </DialogActions>
          </StyledTabPanel>
        </TabContext>
      </Dialog>
      <Tooltip title={clearTooltip}>
        <IconButton
          disabled={disableReset.all && disableReset.current}
          color="inherit"
          onClick={() => setClearOpen(true)}
          size="large"
        >
=======
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
            disabled={disableReset.all}
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
        <IconButton disabled={disableReset.all} color="inherit" onClick={() => setClearOpen(true)} size="large">
>>>>>>> dev
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
