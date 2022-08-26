const defaults: Record<string, any> = {
  is12HourMode: false,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isShowOnlyOpenClasses: false,
  isDefaultUnscheduled: false,
  isHideClassInfo: false,
  isSortAlphabetic: false,
  userID: '',
  accessToken: '',
  userPicture: '',
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
};

export default defaults;
