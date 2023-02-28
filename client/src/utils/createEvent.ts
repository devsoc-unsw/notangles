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
  const isMidnight = endTime.getHours() + endTime.getMinutes() / 60 === 0;
  console.log(day);

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
      end: isMidnight ? 24.0 : endTime.getHours() + endTime.getMinutes() / 60,
    },
  };
  return newEvent;
};

export const createNewInviteEvent = (
  name: string,
  location: string,
  description: string,
  color: string,
  day: number,
  startTime: number,
  endTime: number
) => {
  console.log(`invite ${name}`);
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
