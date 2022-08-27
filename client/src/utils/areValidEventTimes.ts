/**
 * @param start The starting time of the  event
 * @param end The ending time of the event
 * @returns Whether the start and end times represent a valid event
 */
export const areValidEventTimes = (start: Date, end: Date) => {
  return start.getHours() + start.getMinutes() / 60 < end.getHours() + end.getMinutes() / 60;
};
