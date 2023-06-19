import {
  Action,
  Activity,
  ClassData,
  CreatedEvents,
  EventTime,
  InInventory,
  SelectedClasses,
  TimetableData,
} from '../interfaces/Periods';
import { v4 as uuidv4 } from 'uuid';

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

const extractHistoryInfo = (timetableId: string, timetableActions: any, actionsPointer: any) => {
  const courses = timetableActions.current[timetableId][actionsPointer.current[timetableId]].courses;
  const classes = duplicateClasses(timetableActions.current[timetableId][actionsPointer.current[timetableId]].classes);
  const events = timetableActions.current[timetableId][actionsPointer.current[timetableId]].events;
  return { courses: courses, classes: classes, events: events };
};

const areIdenticalTimetables = (
  currentActions: Action[],
  currentPointer: number,
  selectedClasses: SelectedClasses,
  createdEvents: CreatedEvents,
  currentTimetable: TimetableData
): boolean => {
  return (
    currentActions.length > 0 &&
    areIdenticalClasses(currentActions[currentPointer].classes, selectedClasses) &&
    areIdenticalEvents(currentActions[currentPointer].events, createdEvents) &&
    currentActions[currentPointer].name === currentTimetable.name
  );
};

const createDefaultTimetable = (): TimetableData[] => {
  return [
    {
      name: 'My timetable',
      id: uuidv4(),
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    },
  ];
};

export {
  duplicateClasses,
  areIdenticalClasses,
  areIdenticalEvents,
  areIdenticalTimetables,
  extractHistoryInfo,
  createDefaultTimetable,
};
