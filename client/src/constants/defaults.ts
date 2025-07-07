import { createDefaultTimetable } from '../utils/timetableHelpers';
import { themes } from './theme';

const defaults: Record<string, any> = {
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
  timetables: {
    // TODO: Find a safer way to handle this across years
    U12025: createDefaultTimetable(''),
    T12025: createDefaultTimetable(''),
    T22025: createDefaultTimetable(''),
    T32025: createDefaultTimetable(''),
  },
  version: 2,
};

export default defaults;
