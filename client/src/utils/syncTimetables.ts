import { API_URL } from '../api/config';
import getCourseInfo from '../api/getCourseInfo';
import { User } from '../components/sidebar/UserAccount';
import useColorMapper from '../hooks/useColorMapper';
import {
  ClassData,
  CourseData,
  CreatedEvents,
  DisplayTimetablesMap,
  EventPeriod,
  SelectedClasses,
  TimetableData,
} from '../interfaces/Periods';

interface DiffID {
  delete: Set<string>;
  update: Set<string>;
  add: Set<string>;
}

let timeoutID: NodeJS.Timeout;

// Helper function to determine what year a term is in
const getTimetableYear = (targetTerm: string, currentTerm: string, currentYear: string) => {
  try {
    const pattern = /[0-9]+$/;
    const currNo = currentTerm.match(pattern);
    const targetNo = targetTerm.match(pattern);

    if (!currNo || !targetNo) {
      return currentYear;
    }

    // Example: 2023 T3 is before 2024 T1
    if (Number(targetNo[0]) > Number(currNo[0])) {
      return String(Number(currentYear) - 1);
    }

    return currentYear;
  } catch (e) {
    return currentYear;
  }
};

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

const convertEventToDTO = (createdEvents: CreatedEvents, timetableId?: string) => {
  return Object.values(createdEvents).map((period) => {
    const { subtype, event, time } = period;

    const eventDTO = {
      id: event.id,
      name: event.name,
      location: event.location,
      description: event.description,
      colour: event.color,
      day: Number(time.day),
      start: Number(time.start),
      end: Number(time.end),
      subtype: subtype,
    };

    return {
      ...eventDTO,
      ...(timetableId && { timetableId }),
    };
  });
};

const convertTimetableToDTO = (timetable: TimetableData) => {
  return {
    ...timetable,
    selectedCourses: timetable.selectedCourses.map((t) => t.code),
    selectedClasses: convertClassToDTO(timetable.selectedClasses),
    createdEvents: convertEventToDTO(timetable.createdEvents, timetable.id),
  };
};

// DATABASE TO FRONTEND PARSING of a timetable. TODO: change type later
const parseTimetableDTO = async (timetableDTO: any, currentTerm: string, currentYear: string) => {
  // console.log(timetableDTO);
  // First, recover course information from course info API
  const courseInfo: CourseData[] = await Promise.all(
    timetableDTO.selectedCourses.map((code: string) => {
      // TODO: populate with year and term dynamically (is convert to local timezone is a setting to recover)
      return getCourseInfo(
        getTimetableYear(timetableDTO.mapKey, currentTerm, currentYear),
        timetableDTO.mapKey,
        code,
        true,
      );
    }),
  );

  // Next, reverse the selected classes info from class data
  const classDataMap: Record<string, ClassData[]> = {}; // k (course code): v (ClassData[])
  courseInfo.forEach((course) => {
    classDataMap[course.code] = Object.values(course.activities).reduce((prev, curr) => prev.concat(curr));
  });

  const selectedClasses: SelectedClasses = {};
  timetableDTO.selectedClasses.forEach((scrapedClassDTO: any) => {
    const classID: string = scrapedClassDTO.classID;
    const courseCode: string = scrapedClassDTO.courseCode;

    if (!selectedClasses[courseCode]) {
      selectedClasses[courseCode] = {};
    }

    selectedClasses[courseCode][scrapedClassDTO.activity] =
      classDataMap[courseCode].find((clz) => String(clz.classNo) === String(classID)) || null;
  });

  // Finally, reverse created events
  const eventsList: EventPeriod[] = timetableDTO.createdEvents.map((eventDTO: any) => {
    return {
      type: 'event',
      subtype: eventDTO.subtype,
      time: {
        day: eventDTO.day,
        start: eventDTO.start,
        end: eventDTO.end,
      },
      event: {
        id: eventDTO.id,
        name: eventDTO.name,
        location: eventDTO.location,
        description: eventDTO.description || '',
        color: eventDTO.colour,
      },
    };
  });
  const createdEvents = eventsList.reduce((prev: CreatedEvents, curr) => {
    const id = curr.event.id;
    prev[id] = curr;
    return prev;
  }, {});

  const parsedTimetable: TimetableData = {
    id: timetableDTO.id,
    name: timetableDTO.name,
    selectedCourses: courseInfo,
    selectedClasses: selectedClasses,
    createdEvents: createdEvents,
    assignedColors: useColorMapper(timetableDTO.selectedCourses, {}),
  };

  return { mapKey: timetableDTO.mapKey, timetable: parsedTimetable };
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
        createdEvents: convertEventToDTO(createdEvents),
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
      // console.log('User is not logged in');
      // return;
    }

    console.log('fuck');

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

const runSync = (
  user: User,
  setUser: (user: User) => void,
  oldMap: DisplayTimetablesMap,
  newMap: DisplayTimetablesMap,
) => {
  clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    if (JSON.stringify(oldMap) === JSON.stringify(newMap)) {
      return;
    }

    for (const key of Object.keys(newMap)) {
      const oldTimetables = oldMap[key] || [];
      const newTimetables = newMap[key];

      const diffs = getTimetableDiffs(oldTimetables, newTimetables);

      updateTimetableDiffs(user.userID, newTimetables, diffs);
    }

    // Save to user timetable
    setUser({ ...user, timetables: newMap });
  }, 5000);
};

export { parseTimetableDTO, runSync };
