export const daysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const daysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const weekdaysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
export const shortDayToIndex: Partial<Record<string, number>> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const timetableWidth = 1100;
export const rowHeight = 60;
export const gridGap = 1;
export const headerPadding = 10;
export const transitionTime = 350;
export const defaultTransition = `all ${transitionTime.toString()}ms`;
