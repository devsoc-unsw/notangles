export type CourseCode = string;
export type Activity = string;
export type InInventory = null;
export type Section = string;
export type Location = string;

export type SelectedClasses = Record<CourseCode, Record<Activity, ClassData | InInventory>>;

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
  course: CourseData;
  activity: Activity;
  enrolments: number;
  capacity: number;
  periods: ClassPeriod[];
  section: Section;
}

export interface InventoryPeriod {
  class: {
    course: CourseData;
    activity: Activity;
  };
}

export interface ClassPeriod {
  class: ClassData;
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

export interface AutoData {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodsListSerialized: string;
}
