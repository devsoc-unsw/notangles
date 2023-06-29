import { createDefaultTimetable } from '../utils/timetableHelpers';

const defaults: Record<string, any> = {
  is12HourMode: true,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isShowOnlyOpenClasses: false,
  isDefaultUnscheduled: false,
  isHideClassInfo: false,
  isHideExamClasses: false,
  isConvertToLocalTimezone: true,
  courseData: {map: new Map()},
  timetables: createDefaultTimetable(),
};

export default defaults;
