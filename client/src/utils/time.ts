export interface ClassTimeRange {
  startMinutes: number;
  endMinutes: number;
}

const parseClockTime = (value: string): number | undefined => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return undefined;

  return hours * 60 + minutes;
};

export const parseClassTimeRange = (value: string): ClassTimeRange | undefined => {
  const [startValue, endValue, ...rest] = value.split(' - ');
  if (!startValue || !endValue || rest.length > 0) return undefined;

  const startMinutes = parseClockTime(startValue);
  let endMinutes = parseClockTime(endValue);
  if (startMinutes === undefined || endMinutes === undefined) return undefined;

  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return { startMinutes, endMinutes };
};

export const generateHour = (n: number, is12HourMode: boolean): string => {
  // Convert the hour to be in the 24 hrs range.
  n = ((n % 24) + 24) % 24;
  if (is12HourMode) {
    const period = n < 12 ? 'am' : 'pm';
    if (n === 0) n = 12;
    if (n > 12) n -= 12;
    return `${String(n)} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

export const generateHours = (startHour: number, endHour: number, is12HourMode: boolean): string[] => {
  const full24HoursArray = Array(24)
    .fill(0)
    .map((_, i) => generateHour(i + 0, is12HourMode));

  // Fill an array with hour strings according to the range
  if (startHour < endHour) {
    return Array(endHour - startHour)
      .fill(0)
      .map((_, i) => generateHour(i + startHour, is12HourMode));
  }
  return full24HoursArray;
};
