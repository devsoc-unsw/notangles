import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redo, Restore, Undo } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Action, Activity, ClassData, CreatedEvents, EventTime, InInventory, SelectedClasses } from '../../interfaces/Periods';

type Actions = Action[];

// Two actions are created when the page first loads
// One, when selectedClasses is initialised, and two, when createdEvents is initialised
const initialIndex = 2;

const History: React.FC = () => {
  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(true);

  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses, createdEvents, setCreatedEvents } =
    useContext(CourseContext);
  const { isDrag, setIsDrag } = useContext(AppContext);

  const actions = useRef<Actions>([]);
  const actionsPointer = useRef(-initialIndex); // set to -initialIndex as it will increment predictably as app starts up
  const dontAdd = useRef(false);

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
    actionsPointer.current += direction;
    setDisableLeft(actionsPointer.current <= 1);
    setDisableRight(actionsPointer.current + 1 >= actions.current.length);
  };

  /**
   * @param curr The current action's selected classes
   * @param next The new selected classes
   * @returns Whether curr and next are equal
   */
  const areIdenticalClasses = (curr: SelectedClasses, next: SelectedClasses) => {
    const cVals = Object.values(curr);
    const nVals = Object.values(next);
    if (cVals.length !== nVals.length) return false;

    for (let i = 0; i < cVals.length; i++) {
      const currClassData = Object.values(cVals[i]);
      const nextClassData = Object.values(nVals[i]);
      if (currClassData.length !== nextClassData.length) return false;

      for (let j = 0; j < currClassData.length; j++) {
        if (!currClassData[j] !== !nextClassData[j]) return false; // If exactly one is null
        if (currClassData[j]?.id !== nextClassData[j]?.id) return false;
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
    if (currEvents.length !== nextEvents.length) return false;

    for (let i = 0; i < currEvents.length; i++) {
      if (!sameTime(currEvents[i].time, nextEvents[i].time)) return false;
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

    if (
      actions.current.length > 1 &&
      areIdenticalClasses(actions.current[actionsPointer.current].classes, selectedClasses) &&
      areIdenticalEvents(actions.current[actionsPointer.current].events, createdEvents)
    ) {
      return;
    }

    // Discard remainding redos as we branched off by making an action
    if (actions.current.length > actionsPointer.current + 1) {
      actions.current = actions.current.slice(0, actionsPointer.current + 1);
    }

    actions.current.push({
      courses: [...selectedCourses],
      classes: duplicateClasses(selectedClasses),
      events: { ...createdEvents },
    });

    incrementActionsPointer(1);
  }, [selectedClasses, isDrag, createdEvents]);

  /**
   * Updates the index of the current action and changes the timetable data to match
   * @param direction Which way to move (1 for increment, -1 for decrement)
   */
  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;
    setSelectedCourses(actions.current[actionsPointer.current].courses);
    setSelectedClasses(duplicateClasses(actions.current[actionsPointer.current].classes)); // Very important to duplicate here again or things will break
    setCreatedEvents(actions.current[actionsPointer.current].events);
  };

  /**
   * Restores the initial state of the timetable (the same state as on first page load)
   */
  const restoreInitial = () => {
    if (!actions.current[initialIndex]) return;

    setSelectedCourses(actions.current[initialIndex].courses);
    setSelectedClasses(duplicateClasses(actions.current[initialIndex].classes));
    setCreatedEvents(actions.current[initialIndex].events);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey || !(event.key === 'z' || event.key === 'y')) return;
    event.preventDefault();
    if (event.key === 'z' && actionsPointer.current > 1) {
      changeHistory(-1);
    }
    if (event.key === 'y' && actionsPointer.current + 1 < actions.current.length) {
      changeHistory(1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', () => setIsDrag(false)); // Only triggers useEffect function if isDrag was true previously
  }, []);

  return (
    <>
      <Tooltip title="Reset Timetable">
        <IconButton color="inherit" onClick={() => restoreInitial()} size="large">
          <Restore />
        </IconButton>
      </Tooltip>
      <Tooltip title="Undo (Ctrl+Z)">
        <span>
          <IconButton disabled={disableLeft} color="inherit" onClick={() => changeHistory(-1)} size="large">
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
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
