import React, { useContext, useEffect, useRef, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Tooltip from '@material-ui/core/Tooltip';
import { CourseContext } from '../context/CourseContext';
import { Activity, ClassData, InInventory, CourseData, SelectedClasses } from '../interfaces/Course';
import { AppContext } from '../context/AppContext';
import RestoreIcon from '@material-ui/icons/Restore';

interface Action {
  courses: CourseData[];
  classes: SelectedClasses;
}

type Actions = Action[];

const History: React.FC = () => {
  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses } = useContext(CourseContext);
  useContext(AppContext);

  const actions = useRef<Actions>([]);
  const actionsPointer = useRef(-1);
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

  useEffect(() => {
    if (dontAdd.current) {
      dontAdd.current = false;
      return; // prevents adding change induced from re/undo click
    }
    if (actions.current.length > actionsPointer.current + 1) {
      // discard remainding redos as we branched off
      actions.current = actions.current.slice(0, actionsPointer.current + 1);
    }
    actions.current.push({ courses: [...selectedCourses], classes: duplicateClasses(selectedClasses) });
    incrementActionsPointer(1);
  }, [selectedClasses]);

  const changeHistory = (direction: number) => {
    incrementActionsPointer(direction);
    dontAdd.current = true;
    setSelectedCourses(actions.current[actionsPointer.current].courses);
    setSelectedClasses(duplicateClasses(actions.current[actionsPointer.current].classes)); // very important to duplicate here again or things will break
  };

  const restoreInitial = () => {
    setSelectedCourses(actions.current[1].courses);
    setSelectedClasses(duplicateClasses(actions.current[1].classes)); // very important to duplicate here again or things will break
  }

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
  }, []);

  return (
    <>
      <Tooltip title="Reset Timetable">
        <IconButton color="inherit" onClick={() => restoreInitial()}>
          <RestoreIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Undo">
        <IconButton disabled={disableLeft} color="inherit" onClick={() => changeHistory(-1)}>
          <Undo />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo">
        <IconButton disabled={disableRight} color="inherit" onClick={() => changeHistory(1)}>
          <Redo />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default History;
