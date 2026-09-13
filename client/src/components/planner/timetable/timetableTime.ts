export const DAY_TO_INDEX: Partial<Record<string, number>> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

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
