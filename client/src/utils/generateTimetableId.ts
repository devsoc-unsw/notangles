import { TimetableData } from '../interfaces/Periods';

// TODO: there is a (small) chance of using the same ID as a recently deleted timetable (stored in TimetableActions in history.ts)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const generateTimetableId = (timetables: TimetableData[]): string => {
  let id: string;
  do {
    id = generateId();
  } while (timetables.find((timetable: TimetableData) => timetable.id === id));

  return id;
};
