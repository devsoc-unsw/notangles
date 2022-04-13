import React, { useContext, useEffect, useRef, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Redo, Restore, Undo } from '@mui/icons-material';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassData, InInventory, CourseData, SelectedClasses } from '../../interfaces/Course';

interface Action {
  courses: CourseData[];
  classes: SelectedClasses;
}

type Actions = Action[];

const History: React.FC = () => {
  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses } = useContext(CourseContext);
  const { isDrag, setIsDrag } = useContext(AppContext);

  const actions = useRef<Actions>([]);
  const actionsPointer = useRef(-1); // set to -1 as it will increment predictably as app starts up
  const dontAdd = useRef(false);

  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(true);
  const duplicateClasses = (prev: SelectedClasses) => {
    const newClasses: SelectedClasses = {};

    Object.entries(prev).forEach(([courseCode, activities]) => {
      const newActivityCopy: Record<Activity, ClassData | InInventory> = {};

      Object.entries(activities).forEach(([activity, classData]) => {
        newActivityCopy[activity] = classData !== null ? { ...classData } : null;
      });
      newClasses[courseCode] = { ...newActivityCopy };
    });

    return newClasses;
  };

  const incrementActionsPointer = (direction: number) => {
    actionsPointer.current += direction;
    setDisableLeft(actionsPointer.current <= 1);
    setDisableRight(actionsPointer.current + 1 >= actions.current.length);
  };

  const areIdenticalClasses = (curr: SelectedClasses, next: SelectedClasses) => {
    const cVals = Object.values(curr);
    const nVals = Object.values(next);
    if (cVals.length !== nVals.length) return false;

    for (let i = 0; i < cVals.length; i++) {
      const ciVals = Object.values(cVals[i]);
      const niVals = Object.values(nVals[i]);
      if (ciVals.length !== niVals.length) return false;

      for (let j = 0; j < ciVals.length; j++) {
        if (!ciVals[j] !== !niVals[j]) return false; // if exactly one is null
        if (ciVals[j]?.id !== niVals[j]?.id) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (isDrag) return;
    if (dontAdd.current) {
      dontAdd.current = false;
      return; // prevents adding change induced from re/undo click
    }
    if (actions.current.length > 1 && areIdenticalClasses(actions.current[actionsPointer.current].classes, selectedClasses))
      return;
    if (actions.current.length > actionsPointer.current + 1) {
      // discard remainding redos as we branched off
      actions.current = actions.current.slice(0, actionsPointer.current + 1);
    }
    actions.current.push({ courses: [...selectedCourses], classes: duplicateClasses(selectedClasses) });
    incrementActionsPointer(1);
  }, [selectedClasses, isDrag]);

  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;
    setSelectedCourses(actions.current[actionsPointer.current].courses);
    setSelectedClasses(duplicateClasses(actions.current[actionsPointer.current].classes)); // very important to duplicate here again or things will break
  };

  const restoreInitial = () => {
    setSelectedCourses(actions.current[1].courses);
    setSelectedClasses(duplicateClasses(actions.current[1].classes));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey) return;
    if (event.key === 'z' && actionsPointer.current > 1) {
      changeHistory(-1);
    }
    if (event.key === 'y' && actionsPointer.current + 1 < actions.current.length) {
      changeHistory(1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', () => setIsDrag(false)); // only triggers useEffect function if isDrag was true previously
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
