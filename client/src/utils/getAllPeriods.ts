import { ClassData, ClassPeriod } from '../interfaces/Timetable';

/**
 * @param activities All activities of the course
 * @param activity An activity of the course
 * @returns A list of all periods for the activity of the course
 */
export const getAllPeriods = (activities: Record<string, ClassData[]>, activity: string) =>
  activities[activity].reduce<ClassPeriod[]>((prev, currClass) => [...prev, ...currClass.periods], []);
