export type CourseCode = string;
export type Activity = string;
export type InInventory = null;
export type Section = string;
export type Location = string;
export type EventCode = string;
export type Status = 'Open' | 'Full' | 'On Hold';

export type SelectedClasses = Record<CourseCode, Record<Activity, ClassData | InInventory>>;
export type CreatedEvents = Record<EventCode, EventPeriod>;

export interface CourseData {
  code: CourseCode;
  name: string;
  earliestStartTime: number;
  latestFinishTime: number;
  activities: Record<Activity, ClassData[]>;
  inventoryData: Record<Activity, InventoryPeriod>;
}

export interface ClassData {
  id: string;
  courseCode: CourseCode;
  courseName: string;
  activity: Activity;
  status: Status;
  enrolments: number;
  capacity: number;
  periods: ClassPeriod[];
  section: Section;
}

export interface InventoryData {
  courseCode: CourseCode;
  activity: Activity;
}

export interface EventData {
  id: string;
  name: string;
  location: string;
  description: string;
  color: string;
}

export interface ClassPeriod {
  type: 'class';
  classId: string;
  courseCode: CourseCode;
  activity: Activity;
  subActivity: string;
  time: ClassTime;
  locations: string[];
}

export interface InventoryPeriod {
  type: 'inventory';
  classId: null;
  courseCode: CourseCode;
  activity: Activity;
}

export interface EventPeriod {
  type: 'event';
  event: EventData;
  time: EventTime;
}

export interface EventTime {
  day: number;
  start: number;
  end: number;
}

export interface ClassTime extends EventTime {
  weeks: number[];
  weeksString: string;
}

export interface AutoData {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodsListSerialized: string;
}

export interface PeriodInfo {
  periodsPerClass: number; // i.e. periods.length
  periodTimes: Array<number>; // for each class in the activity there are periodsPerClass groups of period.Day, period.startTime pairs; periodTimes.length == activity.classes.length * periodsPerClass * 2
  durations: Array<number>; // where the ith period has duration[i] in hours
}

export interface DuplicateClassData {
  duplicateClasses: ClassData[]; // other classes of the same course running at the same time
  sectionsAndLocations: Array<[Section, Location]>; // wherein sectionsAndLocations[i] is a tuple of the Section (i.e. the class' "code") and Location for duplicateClasses[i]
  periodIndex: number; // the relevant index (as classes have multiple periods, i.e. Tut-Labs)
}

export interface Action {
  courses: CourseData[];
  classes: SelectedClasses;
  events: CreatedEvents;
}
