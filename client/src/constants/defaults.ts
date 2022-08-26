const defaults: Record<string, any> = {
  is12HourMode: true,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isShowOnlyOpenClasses: false,
  isDefaultUnscheduled: false,
  isHideClassInfo: false,
  isHideExamClasses: false,
  selectedCourses: [],
  selectedClasses: {},
  hasShownInfoMessage: false,
  termData: 
    { year: '0000',
      termNumber: 1,
      term:`T1`,
      termName: `Term 1`,
      firstDayOfTerm:  `0000-00-00`,
    },
  createdEvents: {},
};

export default defaults;
