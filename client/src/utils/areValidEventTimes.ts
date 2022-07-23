export const areValidEventTimes = (start: Date, end: Date) => {
  return start.getHours() + start.getMinutes() / 60 < end.getHours() + end.getMinutes() / 60;
};
