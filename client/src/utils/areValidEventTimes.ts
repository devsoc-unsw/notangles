import { defaultEndTime } from '../constants/timetable';

export const areValidEventTimes = (start: Date, end: Date) => {
  if (end.getHours() + end.getMinutes() / 60 === 0) {
    return true;
  } else {
    return start.getHours() + start.getMinutes() / 60 < end.getHours() + end.getMinutes() / 60;
  }
};
