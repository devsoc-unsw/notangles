import { createDefaultTimetable } from '../utils/timetableHelpers';

const defaults: Record<string, any> = {
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
};

export default defaults;
