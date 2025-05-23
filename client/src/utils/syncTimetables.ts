import { v4 as uuidv4 } from 'uuid';

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
  ScrapedClassDTO,
  SelectedClasses,
  TimetableData,
  TimetableDTO,
} from '../interfaces/Periods';

interface DiffID {
  delete: Set<string>;
  update: Set<string>;
  add: Set<string>;
}

let timeoutID: NodeJS.Timeout;

const convertClassToDTO = (selectedClasses: SelectedClasses) => {
  const courseCodes = Object.keys(selectedClasses);

  const res = courseCodes.map((courseCode) => {
    const activityNames = Object.keys(selectedClasses[courseCode]);
    return activityNames.map((activity) => {
      const activityData = selectedClasses[courseCode][activity];
      if (activityData) {
        const { id, classNo, year, term, courseCode, activity } = activityData as ClassData;
        return { id, classNo: String(classNo), year, term, courseCode, activity };
      } else {
        // if activityData === null, then it is in inventory.
        return { id: uuidv4(), classNo: '', year: '', term: '', courseCode, activity };
      }
    });
  });

  return res.reduce((prev, curr) => prev.concat(curr), []);

  // const a = Object.values(selectedClasses);
  // const b = a.map((c) => {
  //   const d = Object.values(c);

  //   return d.map((c2) => {
  //     const { id, classNo, year, term, courseCode, activity } = c2 as ClassData;
  //     return { id, classNo: String(classNo), year, term, courseCode, activity };
  //   });
  // });

  // return b.reduce((prev, curr) => prev.concat(curr), []);
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
const parseTimetableDTO = async (timetableDTO: TimetableDTO, currentYear: string) => {
  // First, recover course information from course info API
  const courseInfo: CourseData[] = await Promise.all(
    timetableDTO.selectedCourses.map((code: string) => {
      // TODO: populate with year and term dynamically (is convert to local timezone is a setting to recover)
      return getCourseInfo(timetableDTO.mapKey.slice(0, 2), code, currentYear, true);
    }),
  );

  // Next, reverse the selected classes info from class data
  const classDataMap: Record<string, ClassData[]> = {}; // k (course code): v (ClassData[])
  courseInfo.forEach((course) => {
    classDataMap[course.code] = Object.values(course.activities).reduce((prev, curr) => prev.concat(curr), []);
  });

  const selectedClasses: SelectedClasses = {};
  timetableDTO.selectedClasses.forEach((scrapedClassDTO: ScrapedClassDTO) => {
    const classID = scrapedClassDTO.classID;

    const courseCode: string = scrapedClassDTO.courseCode;

    if (!selectedClasses[courseCode]) {
      selectedClasses[courseCode] = {};
    }

    selectedClasses[courseCode][scrapedClassDTO.activity] =
      classDataMap[courseCode].find((clz) => clz.classNo === classID) || null;
  });
  console.log('selected classes conversion', selectedClasses);

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

export const syncAddTimetable = async (userId: string, newTimetable: TimetableData, term: string) => {
  try {
    if (!userId) {
      console.log('User is not logged in');
      return;
    }
    const { selectedCourses, selectedClasses, createdEvents, name } = newTimetable;
    const res = await fetch(`${API_URL.server}/user/timetable`, {
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
        mapKey: term,
      }),
    });

    const json = await res.json();
    return json.data; // This is the new ID of timetable
  } catch (e) {
    console.log(e);
  }
};

const syncDeleteTimetable = async (timetableId: string) => {
  try {
    await fetch(`${API_URL.server}/user/timetable/${timetableId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.log(e);
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        timetable: convertTimetableToDTO(editedTimetable),
      }),
    });
  } catch (e) {
    console.log(e);
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

  diffIds.delete = oldIds.difference(newIds);
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

const updateTimetableDiffs = async (
  zid: string,
  newTimetables: TimetableData[],
  diffIds: DiffID,
  term: string,
): Promise<TimetableData[]> => {
  diffIds.delete.forEach((id) => {
    syncDeleteTimetable(id);
  });

  return Promise.all(
    newTimetables.map(async (t) => {
      if (diffIds.add.has(t.id)) {
        const newId = await syncAddTimetable(zid, t, term);
        return { ...t, id: newId };
      } else if (diffIds.update.has(t.id)) {
        syncEditTimetable(zid, t);
      }
      return { ...t };
    }),
  );
};

const runSync = (
  user: User,
  setUser: (user: User) => void,
  newMap: DisplayTimetablesMap,
  setMap: (m: DisplayTimetablesMap) => void,
) => {
  clearTimeout(timeoutID);
  timeoutID = setTimeout(async () => {
    const oldMap = { ...user.timetables };
    const trueMap: DisplayTimetablesMap = {};

    if (JSON.stringify(oldMap) === JSON.stringify(newMap)) {
      return;
    }

    for (const key of Object.keys(newMap)) {
      const oldTimetables = oldMap[key] || [];
      const newTimetables = newMap[key];

      const diffs = getTimetableDiffs(oldTimetables, newTimetables);

      trueMap[key] = await updateTimetableDiffs(user.userID, newTimetables, diffs, key);
    }

    // Save to user timetable
    setMap(trueMap);
    setUser({ ...user, timetables: structuredClone(trueMap) });
  }, 5000);
};

export { parseTimetableDTO, runSync };
