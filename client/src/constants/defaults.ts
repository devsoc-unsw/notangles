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
};

export default defaults;
