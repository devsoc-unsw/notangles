export interface Course {
  code: string;
  name: string;
  activities: Record<string, Activity[]>;
  inventoryData: Record<string, InventoryData>;
  earliestStartTime: number;
  latestFinishTime: number;
}

export interface Activity {
  id: string;
  courseCode: string;
  courseName: string;
  activity: string;
  status: string;
  enrolments: number;
  capacity: number;
  periods: ClassPeriod[];
  section: string;
  classNo: string;
  term: string;
  year: string;
}

export interface ClassPeriod {
  type: string;
  classId: string;
  courseCode: string;
  activity: string;
  subActivity: string;
  locations: string[];
  time: TimePeriod;
}

export interface TimePeriod {
  day: number;
  start: number;
  end: number;
  weeks: number[];
  weeksString: string;
}

export interface InventoryData {
  type: string;
  classId: string | null;
  courseCode: string;
  activity: string;
}

export interface Timetable {
  name: string;
  id: string;
  selectedCourses: Course[];
  selectedClasses: Record<string, Record<string, Activity>>;
  createdEvents: Record<string, CreatedEvent>;
  assignedColors: Record<string, string>;
}

export interface CreatedEvent {
  type: string;
  subtype: string;
  event: EventDetails;
  time: TimePeriod;
}

export interface EventDetails {
  id: string;
  name: string;
  location: string;
  description: string;
  color: string;
}

export interface Config {
  currentTheme: string;
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  isShowOnlyOpenClasses: boolean;
  isDefaultUnscheduled: boolean;
  isHideClassInfo: boolean;
  isHideExamClasses: boolean;
  isConvertToLocalTimezone: boolean;
  timetables: Record<string, Timetable[]>;
  courseData: { map: Course[] };
}
