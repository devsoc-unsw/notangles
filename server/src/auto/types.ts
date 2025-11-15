import { AutoTimetableResponse } from './proto/autotimetabler';

export enum ClassMode {
  hybrid = 'hybrid',
  'in person' = 'in person',
  online = 'online',
}

export class ConstraintDTO {
  startHour: number;
  endHour: number;
  selectedDaysStr: string;
  breaksBetweenClasses: number;
  daysAtUni: number;
  mode: ClassMode;
}

export interface AutoTimetableResult {
  result: AutoTimetableResponse;
  classes: {
    course_id: string;
    class_id: string;
    activity: string;
    times: { day: string; time: string }[];
  }[];
  order: string[];
}

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
