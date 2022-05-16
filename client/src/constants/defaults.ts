const defaults: Record<string, any> = {
  is12HourMode: true,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isSquareEdges: false,
  isHideFullClasses: false,
  isDefaultUnscheduled: false,
  isHideClassInfo: false,
  isSortAlphabetic: false,
  userID: '',
  accessToken: '',
  userPicture: '',
  selectedCourses: [],
  selectedClasses: {},
  selectedEvents: {
    'event1': {
      'name': 'hi mom',
      'time': {
        'day': 3,
        'start': 10,
        'end': 12,
      },
      'location': "moms house",
      'description': "go say hi to mom",
    }
  },
  hasShownInfoMessage: false,
};

export default defaults;
