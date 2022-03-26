import React, { useContext, useEffect, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Tooltip from '@material-ui/core/Tooltip';
import { CourseContext } from '../context/CourseContext';
import { Activity, ClassData, InInventory, CourseData, SelectedClasses } from '../interfaces/Course';

interface Action {
  courses: CourseData[];
  classes: SelectedClasses;
}

type Actions = Action[];

const History: React.FC = () => {
  const { selectedCourses, setSelectedCourses, selectedClasses, setSelectedClasses } = useContext(CourseContext);

  const actions = useRef<Actions>([]);
  const actionsPointer = useRef(-1);
  const dontAdd = useRef(false);

  const duplicateClasses = (prev: SelectedClasses) => {
    const newClasses: SelectedClasses = {};

    Object.entries(prev).forEach(([courseCode, activities]) => {
      const newActivityCopy: Record<Activity, ClassData | InInventory> = {};

      Object.entries(activities).forEach(([activity, classData]) => {
        if (classData !== null) {
          newActivityCopy[activity] = {
            id: classData.id,
            course: classData.course,
            activity: classData.activity,
            enrolments: classData.enrolments,
            capacity: classData.capacity,
            periods: classData.periods,
          };
        }
      });
      newClasses[courseCode] = { ...newActivityCopy };
    });

    return newClasses;
  };

  useEffect(() => {
    if (!dontAdd.current) {
      if (actions.current.length > actionsPointer.current + 1) {
        actions.current = [
          ...actions.current.slice(0, actionsPointer.current + 1),
          { courses: { ...selectedCourses }, classes: duplicateClasses(selectedClasses) },
        ];
        
      } else {
        actions.current.push({ courses: { ...selectedCourses }, classes: duplicateClasses(selectedClasses) });
      }
      actionsPointer.current++;

      // console.log(actions.current.map((c) => (Object.entries(c.classes).map(([cc, v])=> {return Object.entries(v).map(([bbb, vvv]) => vvv?.id)}))), actionsPointer.current);
    }

    dontAdd.current = false;
  }, [selectedClasses]);

  const changeHistory = (direction: number) => {
    if (actionsPointer.current + direction >= 1 && actionsPointer.current + direction < actions.current.length) {
      actionsPointer.current += direction;
      dontAdd.current = true;

      setSelectedClasses(duplicateClasses(actions.current[actionsPointer.current].classes)); // very important to duplicate here again or things will break
      // setSelectedCourses(actions.current[actionsPointer.current].courses);
      
      // console.log(actions.current.map((c) => (Object.entries(c.classes).map(([cc, v])=> {return Object.entries(v).map(([bbb, vvv]) => vvv?.id)}))), actionsPointer.current);
    }
  };

  return (
    <>
      <Tooltip title="Undo">
        <IconButton color="inherit" onClick={() => changeHistory(-1)}>
          <Undo />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo">
        <IconButton color="inherit" onClick={() => changeHistory(1)}>
          <Redo />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default History;
