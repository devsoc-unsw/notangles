import { Activity, ClassData, ClassPeriod } from '../interfaces/Periods';

/**
 * @param activities All activities of the course
 * @param activity An activity of the course
 * @returns A list of all periods for the activity of the course
 */
export const getAllPeriods = (activities: Record<Activity, ClassData[]>, activity: string) =>
  activities[activity].reduce((prev, currClass) => [...prev, ...currClass.periods], [] as ClassPeriod[]);
