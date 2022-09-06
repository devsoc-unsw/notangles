import { v4 as uuidv4 } from 'uuid';
import { daysShort } from '../constants/timetable';
import { EventPeriod } from '../interfaces/Periods';

export const createNewEvent = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: string,
  startTime: Date,
  endTime: Date
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
      day: daysShort.indexOf(day) + 1,
      start: startTime.getHours() + startTime.getMinutes() / 60,
      end: endTime.getHours() + endTime.getMinutes() / 60,
    },
  };
  return newEvent;
};
