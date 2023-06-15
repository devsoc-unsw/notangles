import { v4 as uuidv4 } from 'uuid';
import { daysShort } from '../constants/timetable';
import { EventPeriod } from '../interfaces/Periods';

/**
 * Returns an event object with all the event info
 * This was made to directly pass day, startTime, endTime for creating events via link
 * @param name
 * @param location
 * @param description
 * @param color
 * @param day
 * @param startTime
 * @param endTime
 * @returns EventPeriod object
 */
export const createEventObj = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: number,
  startTime: number,
  endTime: number
): EventPeriod => {
  const newEvent: EventPeriod = {
    type: 'event',
    event: {
      id: uuidv4(),
      name: name,
      location: location,
      description: description,
      color: color,
    },
    time: {
      day: day,
      start: startTime,
      end: endTime,
    },
  };

  return newEvent;
};

/**
 * Similar to the createEventObj function
 * except that it converts the type of day, startTime and endTime
 * @param name
 * @param location
 * @param description
 * @param color
 * @param day
 * @param startTime
 * @param endTime
 * @returns EventPeriod object
 */
export const parseAndCreateEventObj = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: string,
  startTime: Date,
  endTime: Date
): EventPeriod => {
  const isMidnight = endTime.getHours() + endTime.getMinutes() / 60 === 0;
  const eventDay = daysShort.indexOf(day) + 1;
  const eventStart = startTime.getHours() + startTime.getMinutes() / 60;
  const eventEnd = isMidnight ? 24.0 : endTime.getHours() + endTime.getMinutes() / 60;

  return createEventObj(name, location, description, color, eventDay, eventStart, eventEnd);
};
