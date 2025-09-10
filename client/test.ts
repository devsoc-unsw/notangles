import { NewTimetableData } from './src/interfaces/Periods';

const initData = {
  timetableIds: [
    '9e946718-302a-4eae-9d33-fb3620cf77e6',
    'cd65a200-b0c2-417c-9e1f-572c4e137fcc',
    '8ca3bd6a-c461-4f06-8034-cc26c5052517',
  ],
  timetables: {
    '8ca3bd6a-c461-4f06-8034-cc26c5052517': {
      name: 'Test 3',
      primary: false,
      courseIds: [],
      courses: {},
    },
    '9e946718-302a-4eae-9d33-fb3620cf77e6': {
      name: 'Testing timetable',
      primary: true,
      courseIds: [],
      courses: {},
    },
    'cd65a200-b0c2-417c-9e1f-572c4e137fcc': {
      name: 'Testing timetable - Copy',
      primary: false,
      courseIds: [],
      courses: {},
    },
  },
  selectedTimetableId: '9e946718-302a-4eae-9d33-fb3620cf77e6',
};

const newData = initData as {
  timetableIds: string[];
  timetables: Record<string, NewTimetableData>;
  selectedTimetableId: string;
};

export default newData;
