import { API_URL } from '../api/config';
import { DisplayTimetablesMap, TimetableDTO, TimetableData } from '../interfaces/Periods';

enum TimetableAction {
  CREATE_NEW_TIMETABLE,
}

export const syncTimetables = async (
  oldTimetable: DisplayTimetablesMap,
  newTimetable: DisplayTimetablesMap,
  action: TimetableAction,
) => {
  if (!oldTimetable || !newTimetable) return;

  // Make sure all the Timetables in each term is fine
  for (const term of Object.keys(newTimetable)) {
  }
  // Flatten the timetables.
};
