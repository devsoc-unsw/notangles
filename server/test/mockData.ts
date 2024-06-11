import { ClassType } from '@prisma/client';

const mockData = {
  users: [
    {
      userID: 'z55555555',
      firstname: 'First',
      lastname: 'Last',
      email: 'test@gmail.com',
      profileURL: 'images.google.com/blahblah',
    },
    {
      userID: 'z66666666',
      firstname: 'B',
      lastname: '',
      email: 'second@gmail.com',
      profileURL: '',
    },
    {
      userID: 'z77777777',
      firstname: 'C',
      lastname: '',
      email: 'third@gmail.com',
      profileURL: '',
    },
  ],
  setting: {
    is12HourMode: true,
    isDarkMode: true,
    isSquareEdges: true,
    isHideFullClasses: true,
    isDefaultUnscheduled: true,
    isHideClassInfo: true,
    isSortAlphabetic: true,
    isShowOnlyOpenClasses: true,
    isHideExamClasses: false,
    isConvertToLocalTimezone: true,
  },
  timetables: [
    {
      selectedCourses: [],
      selectedClasses: [],
      createdEvents: [],
      name: 'timetable1',
    },
    {
      selectedCourses: ['COMP1511', 'COMP2511'],
      selectedClasses: [
        {
          id: 'c1',
          classType: ClassType.LABORATORY,
          courseCode: 'COMP1511',
          section: 'F111A',
        },
        {
          id: 'c2',
          classType: ClassType.LECTURE,
          courseCode: 'COMP2511',
          section: 'A',
        },
      ],
      createdEvents: [
        {
          id: 'e1',
          name: 'event1',
          location: 'UNSW',
          colour: 'FFFFFF',
          day: 'Monday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e2',
          name: 'event2',
          location: 'Online',
          colour: '000000',
          day: 'Tuesday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
      ],
      name: 'timetable2',
    },
    {
      selectedCourses: ['COMP1511', 'COMP2511'],
      selectedClasses: [
        {
          id: 'c1',
          classType: ClassType.LABORATORY,
          courseCode: 'COMP1511',
          section: 'F111A',
        },
        {
          id: 'c2',
          classType: ClassType.LECTURE,
          courseCode: 'COMP2511',
          section: 'A',
        },
        {
          id: 'c3',
          classType: ClassType.OTHER,
          courseCode: 'COMP2511',
          section: 'B123',
        },
      ],
      createdEvents: [
        {
          id: 'e1',
          name: 'event1',
          location: 'UNSW',
          colour: 'FFFFFF',
          day: 'Monday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e2',
          name: 'event2',
          location: 'Online',
          colour: '000000',
          day: 'Tuesday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e3',
          name: 'event3',
          location: 'CBD',
          colour: '000000',
          day: 'Friday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
      ],
      name: 'my timetable',
    },
  ],
};

export default mockData;
