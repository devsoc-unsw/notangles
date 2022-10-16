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
    result += `${String(((n % 1) * 60) >> 0)}`;
  } else {
    result += '00';
  }

  return result;
};
