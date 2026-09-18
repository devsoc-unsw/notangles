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
