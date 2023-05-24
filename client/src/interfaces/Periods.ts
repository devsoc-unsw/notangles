export type CourseCode = string;
export type Activity = string;
export type InInventory = null;
export type Section = string;
export type Location = string;
export type EventCode = string;
export type Status = 'Open' | 'Full' | 'On Hold';

export type SelectedClasses = Record<CourseCode, Record<Activity, ClassData | InInventory>>;
export type CreatedEvents = Record<EventCode, EventPeriod>;
export type EventMetadata = EventData & EventTime;

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
  // The number of periods the class has per week
  periodsPerClass: number;

  // For each class in the activity there are periodsPerClass groups
  // of (period.time.day, period.time.start) pairs
  // i.e. periodTimes.length == activity.classes.length * periodsPerClass * 2
  periodTimes: Array<number>;

  // The ith period has duration[i] in hours
  durations: Array<number>;
}

export interface DuplicateClassData {
  // Other classes of the same course running at the same time
  duplicateClasses: ClassData[];

  // sectionsAndLocations[i] is a tuple of the Section (i.e. the class's "code") and Location for duplicateClasses[i]
  sectionsAndLocations: Array<[Section, Location]>;

  // The relevant index of the class (as classes have multiple periods, i.e. Tut-Labs)
  periodIndex: number;
}

export interface Action {
  courses: CourseData[];
  classes: SelectedClasses;
  events: CreatedEvents;
}
