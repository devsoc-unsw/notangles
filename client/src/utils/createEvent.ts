import { v4 as uuidv4 } from 'uuid';
import { daysShort } from '../constants/timetable';
import { EventPeriod } from '../interfaces/Periods';

export const parseAndCreateNewEvent = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: string,
  startTime: Date,
  endTime: Date
) => {
  const isMidnight = endTime.getHours() + endTime.getMinutes() / 60 === 0;
  const eventDay = daysShort.indexOf(day) + 1;
  const eventStart = startTime.getHours() + startTime.getMinutes() / 60;
  const eventEnd = isMidnight ? 24.0 : endTime.getHours() + endTime.getMinutes() / 60;

  return createNewEvent(name, location, description, color, eventDay, eventStart, eventEnd);
};

export const createNewEvent = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: number,
  startTime: number,
  endTime: number
) => {
  const uuid = uuidv4();

  const newEvent: EventPeriod = {
    type: 'event',
    event: {
      id: uuid,
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
