import { createDefaultTimetable } from '../utils/timetableHelpers';
import { lightTheme, themes } from './theme';

const defaults: Record<string, any> = {
  themeObject: lightTheme(Object.keys(themes)[0]),
  currentTheme: Object.keys(themes)[0],
  is12HourMode: true,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isShowOnlyOpenClasses: false,
  isDefaultUnscheduled: true,
  isHideClassInfo: false,
  isHideExamClasses: false,
  isConvertToLocalTimezone: false,
  courseData: { map: [] },
  timetables: { T0: createDefaultTimetable('') },
  version: 1,
};

export default defaults;
