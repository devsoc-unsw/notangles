/**
 * @param start The starting time of the event
 * @param end The ending time of the event
 * @returns Whether the start and end times represent a valid event
 */
export const areValidEventTimes = (start: Date, end: Date) => {
  // Return true if the event ends at midnight
  if (end.getHours() + end.getMinutes() / 60 === 0) {
    return true;
  } else {
    return start.getHours() + start.getMinutes() / 60 < end.getHours() + end.getMinutes() / 60;
  }
};

/**
 * @param time The start or end time of the event
 * @returns Whether the start and end times represent a valid event
 */
export const createDateWithTime = (time: number) => {
  return new Date(2022, 0, 0, time, (time - Math.floor(time)) * 60);
};
