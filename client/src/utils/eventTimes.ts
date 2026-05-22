/**
 * @param time The time to convert
 * @returns The time as a decimal hour in the range 0-23.99
 */
export const getTimeValue = (time: Date) => time.getHours() + time.getMinutes() / 60;

/**
 * @param time The event end time to convert
 * @returns The event end time as a decimal hour, using 24 for midnight
 */
export const getEventEndTimeValue = (time: Date) => {
  const timeValue = getTimeValue(time);
  return timeValue === 0 ? 24 : timeValue;
};

/**
 * @param start The starting time of the event
 * @param end The ending time of the event
 * @returns Whether the start and end times represent a valid event
 */
export const areValidEventTimes = (start: Date, end: Date) => {
  const startTime = getTimeValue(start);
  const endTime = getTimeValue(end);

  // Return true if the event ends at midnight
  if (endTime === 0) {
    return true;
  } else {
    return startTime < endTime;
  }
};

/**
 * @param time The start or end time of the event
 * @returns Whether the start and end times represent a valid event
 */
export const createDateWithTime = (time: number) => {
  return new Date(2022, 0, 0, time, (time - Math.floor(time)) * 60);
};

/**
 * @param day The day of the week the event starts on
 * @returns An array of the days of the week starting with the given day
 */
export const resizeWeekArray = (day: number) => {
  const MondayToSunday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return MondayToSunday.slice(day);
};
