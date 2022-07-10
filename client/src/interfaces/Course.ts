import { ColorValue } from 'mui-color';

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
  course: CourseData;
  activity: Activity;
  status: Status;
  enrolments: number;
  capacity: number;
  periods: ClassPeriod[];
  section: Section;
}

export interface EventData {
  id: string;
  name: string;
  location: string;
  description: string;
  color: ColorValue;
}

export interface ClassPeriod {
  class: ClassData;
  time: ClassTime;
  locations: string[];
}

export interface InventoryPeriod {
  class: {
    course: CourseData;
    activity: Activity;
  };
}

export interface EventPeriod {
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
