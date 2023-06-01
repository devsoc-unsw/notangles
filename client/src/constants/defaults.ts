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
      name: 'Timetable0',
      id: 'temp',
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    },
  ],
};

export default defaults;
