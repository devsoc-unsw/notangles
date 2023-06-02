import { v4 as uuidv4 } from 'uuid';

const defaults: Record<string, any> = {
  is12HourMode: true,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isShowOnlyOpenClasses: false,
  isDefaultUnscheduled: false,
  isHideClassInfo: false,
  isHideExamClasses: false,
  isConvertToLocalTimezone: true,
  timetables: [
    {
      name: 'My timetable',
      id: uuidv4(),
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    },
  ],
};

export default defaults;
