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
  timetables: [...createDefaultTimetable('')],
  version: 2,
};

export default defaults;
