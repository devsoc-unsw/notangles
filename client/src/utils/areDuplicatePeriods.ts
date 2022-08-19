import { ClassPeriod } from '../interfaces/Periods';

/**
 * @param a A class period
 * @param b Another class period
 * @returns Whether the two periods are duplicates
 */
export const areDuplicatePeriods = (a: ClassPeriod, b: ClassPeriod) =>
  a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;
