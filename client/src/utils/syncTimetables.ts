import { API_URL } from '../api/config';
import { ClassData, CreatedEvents, DisplayTimetablesMap, SelectedClasses, TimetableData } from '../interfaces/Periods';

interface DiffID {
  delete: Set<string>;
  update: Set<string>;
  add: Set<string>;
}

let timeoutID: NodeJS.Timeout;

const convertClassToDTO = (selectedClasses: SelectedClasses) => {
  const a = Object.values(selectedClasses);
  const b = a.map((c) => {
    const d = Object.values(c);
    return d.map((c) => {
      const { id, classNo, year, term, courseCode } = c as ClassData;
      return { id, classNo: String(classNo), year, term, courseCode };
    });
  });

  return b.reduce((prev, curr) => prev.concat(curr));
};

// TODO: Events don't really make sense right now. Timetable takes datetime, but frontend can only select
// day + time of day, not specific date. Modify this later
const convertEventToDTO = (createdEvents: CreatedEvents) => {
  console.log(createdEvents);
  return [];
};

const convertTimetableToDTO = (timetable: TimetableData) => {
  return {
    ...timetable,
    selectedCourses: timetable.selectedCourses.map((t) => t.code),
    selectedClasses: convertClassToDTO(timetable.selectedClasses),
    createdEvents: convertEventToDTO(timetable.createdEvents),
  };
};

const syncAddTimetable = async (userId: string, newTimetable: TimetableData) => {
  try {
    if (!userId) {
      console.log('User is not logged in');
      return;
    }
    const { selectedCourses, selectedClasses, createdEvents, name } = newTimetable;
    await fetch(`${API_URL.server}/user/timetable`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        selectedCourses: selectedCourses.map((t) => t.code),
        selectedClasses: convertClassToDTO(selectedClasses),
        createdEvents: convertEventToDTO(createdEvents), // TODO
        name,
      }),
    });
  } catch (e) {
    console.log('todo');
  }
};

const syncDeleteTimetable = async (timetableId: string) => {
  try {
    await fetch(
      `${API_URL.server}/user/timetable` +
        new URLSearchParams({
          timetableId,
        }).toString(),
      {
        method: 'DELETE',
      },
    );
  } catch (e) {
    console.log('todo');
  }
};

const syncEditTimetable = async (userId: string, editedTimetable: TimetableData) => {
  try {
    if (!userId) {
      console.log('User is not logged in');
      return;
    }

    await fetch(`${API_URL.server}/user/timetable`, {
      method: 'PUT',
      body: JSON.stringify({
        timetable: convertTimetableToDTO(editedTimetable),
      }),
    });
  } catch (e) {
    console.log('todo');
  }
};

/**
 * Between two term timetables - find new timetables, deleted timetables, and updated timetable ids
 */
const getTimetableDiffs = (oldTimetables: TimetableData[], newTimetables: TimetableData[]) => {
  const diffIds: DiffID = {
    delete: new Set(),
    update: new Set(),
    add: new Set(),
  };

  const oldIds = new Set(oldTimetables.map((t) => t.id));
  const newIds = new Set(newTimetables.map((t) => t.id));

  diffIds.add = oldIds.difference(newIds);
  diffIds.add = newIds.difference(oldIds);

  oldIds.intersection(newIds).forEach((id) => {
    const oldTarget = oldTimetables.find((t) => t.id === id);
    const newTarget = newTimetables.find((t) => t.id === id);

    if (JSON.stringify(oldTarget) !== JSON.stringify(newTarget)) {
      diffIds.update.add(id);
    }
  });

  return diffIds;
};

const updateTimetableDiffs = (zid: string, newTimetables: TimetableData[], diffIds: DiffID) => {
  diffIds.delete.forEach((id) => {
    syncDeleteTimetable(id);
  });

  newTimetables.forEach((t) => {
    if (diffIds.add.has(t.id)) {
      syncAddTimetable(zid, t);
    } else if (diffIds.update.has(t.id)) {
      syncEditTimetable(zid, t);
    }
  });
};

const runSync = (zid: string, oldMap: DisplayTimetablesMap, newMap: DisplayTimetablesMap) => {
  clearTimeout(timeoutID);

  timeoutID = setTimeout(() => {
    if (JSON.stringify(oldMap) === JSON.stringify(newMap)) {
      return;
    }

    for (const key of Object.keys(newMap)) {
      const oldTimetables = oldMap[key];
      const newTimetables = newMap[key];

      const diffs = getTimetableDiffs(oldTimetables, newTimetables);

      updateTimetableDiffs(zid, newTimetables, diffs);
    }
  }, 5000);
};

export { runSync };
