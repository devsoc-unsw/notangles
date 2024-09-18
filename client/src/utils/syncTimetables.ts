import { API_URL } from '../api/config';
import { ClassData, CreatedEvents, SelectedClasses, TimetableData } from '../interfaces/Periods';

const convertClassToDTO = (selectedClasses: SelectedClasses) => {
  const a = Object.values(selectedClasses);
  const b = a.map((c) => {
    const d = Object.values(c);
    return d.map((c) => {
      const { id, classNo, year, term, courseCode } = c as ClassData;
      return { id, classNo, year, term, courseCode };
    });
  });

  return b.reduce((prev, curr) => prev.concat(curr));
};

// TODO: Events don't really make sense right now. Timetable takes datetime, but frontend can only select
// day + time of day, not specific date. Modify this later
const convertEventToDTO = (createdEvents: CreatedEvents) => {
  return [];
};

const convertTimetableToDTO = (timetable: TimetableData) => {
  return {
    ...timetable,
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
        selectedCourses,
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

const syncDeleteTimetables = async (timetables: TimetableData[]) => {
  try {
    await Promise.all(timetables.map((t) => t.id).map((id) => syncDeleteTimetable(id)));
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

export { syncAddTimetable, syncDeleteTimetable, syncDeleteTimetables, syncEditTimetable };
