export interface ClassTimeRange {
  startMinutes: number;
  endMinutes: number;
}

class ClassTimeParseError extends Error {}

/**
 * Parse a 24-hour clock time into minutes from midnight.
 *
 * @param value     Time in HH:mm format
 * @param classId   Class ID used in error message
 * @returns         Minutes from midnight in a range of [0, 1439]
 * @throws {Error}  If the input is not a valid 24-hour clock time
 *
 * @example         parseClockTime('09:30', '12345'); // 570
 */
const parseClockTime = (value: string, classId: string): number => {
  const description = `Failed to parse time for class ${classId}.`;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) throw new ClassTimeParseError(description);

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new ClassTimeParseError(description);
  }

  return hours * 60 + minutes;
};

/**
 * Parse a class time range into minute offsets from midnight
 *
 * @param value     Two 24-hour clock times separated by " - "
 * @param classId   Class ID used in error message
 * @returns         Start and end minute offsets, the end may extend to tomorrow
 * @throws {Error}  If the range format or either clock time is invalid
 *
 * @example
 * parseClassTimeRange('09:00 - 11:00', '12345');
 * // { startMinutes: 540, endMinutes: 660 }
 *
 * @example
 * parseClassTimeRange('23:00 - 01:00', '12345');
 * // { startMinutes: 1380, endMinutes: 1500 }
 */
export const parseClassTimeRange = (value: string, classId: string): ClassTimeRange => {
  // Example input: "09:00 - 11:00" -> { startMinutes: 540, endMinutes: 660 }.
  const description = `Failed to parse time for class ${classId}.`;
  const [startValue, endValue, ...rest] = value.split(' - ');
  if (!startValue || !endValue || rest.length > 0) {
    throw new ClassTimeParseError(description);
  }

  const startMinutes = parseClockTime(startValue, classId);
  let endMinutes = parseClockTime(endValue, classId);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return { startMinutes, endMinutes };
};

type ClassTimeParseResult = { ok: true; value: ClassTimeRange } | { ok: false; error: Error };

// Capture invalid class times for displaying an error without interrupting rendering
export const tryParseClassTimeRange = (value: string, classId: string): ClassTimeParseResult => {
  try {
    return { ok: true, value: parseClassTimeRange(value, classId) };
  } catch (error) {
    if (!(error instanceof ClassTimeParseError)) throw error;
    return { ok: false, error };
  }
};

export const weeksStringToArray = (weeks: string): number[] => {
  // Converts from "1-5,7,9-12" to [1,2,3,4,5,7,9,10,11,12]
  const result: number[] = [];
  for (const part of weeks.split(',')) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      result.push(Number(part));
    }
  }
  return result;
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

/**
 * @param n The hour to convert
 * @returns The hour represented in 24 hour format
 */
export const to24Hour = (n: number) => {
  // If the event time happens from 00:00 to 00:59, change the hour to 00 instead of 24
  const isMidnight = n == 24 || n == 0;
  let result = '';

  if (isMidnight) {
    result += '00:';
  } else {
    if ((n / 1) >> 0 < 10) {
      result += '0';
    }
    result += `${String((n / 1) >> 0)}:`;
  }

  if ((n % 1) * 60) {
    if ((n % 1) * 60 < 10) {
      result += '0';
    }
    result += String(((n % 1) * 60) >> 0);
  } else {
    result += '00';
  }

  return result;
};
