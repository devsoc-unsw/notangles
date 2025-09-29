export type Modes = 'In Person' | 'Online';
export type Status = 'Open' | 'Full' | 'On Hold';
export type CourseCode = string;
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface GQLCourseOverview {
  id: string;
  code: string;
  name: string;
  career: string;
  modes: Modes[];
  faculty: string;
  inPerson: boolean;
  online: boolean;
}

export interface NewData {
  timetableIds: string[];
  timetables: Record<string, NewTimetableData>;
  selectedTimetableId: string;
}

export interface NewTimetableData {
  name: string;
  primary: boolean;
  courseIds: string[];
  courses: Record<string, NewCourseData>;
}

export interface NewCourseData {
  code: string;
  color: string;
  classIds: string[];
}

export type CourseActivities = Record<string, Record<string, ClassData[]>>;

export interface GQLClassData {
  id: string;
  activity: string;
  status: Status;
  enrolments: string;
  section: string;
  term: string;
  year: string;
  course: { course_id: string; course_code: string; course_name: string };
  times: {
    day: Day;
    time: string;
    weeks: string;
    location: string;
  }[];
}

export interface ClassData {
  id: string;
  classNo: string;
  courseCode: string;
  courseName: string;
  section: string;
  activity: string;
  status: Status;
  enrolments: number;
  capacity: number;
  periods: ClassPeriod[];
  term: string;
  year: string;
}

export interface ClassPeriod {
  type: 'class';
  classId: string;
  courseId: string;
  activity: string;
  subActivity: string | null;
  time: ClassTime;
  locations: string[];
}

export interface ClassTime {
  day: number;
  start: number;
  end: number;
  weeks: number[];
  weeksString: string;
}

export interface InventoryPeriod {
  type: 'inventory';
  courseId: string;
  activity: string;
  numberClass: number;
}
