import { Activity, CourseCode, Section, Status } from './Periods';

// List of the interfaces and types that are used in the scraper

export interface DbCourse {
  courseCode: CourseCode;
  name: string;
  classes: DbClass[];
}

export interface DbClass {
  activity: Activity;
  times: DbTimes[];
  status: Status;
  courseEnrolment: DbCourseEnrolment;
  section: Section;
}

export interface DbCourseEnrolment {
  enrolments: number;
  capacity: number;
}

export interface DbTimes {
  time: DbTime;
  day: string;
  location: string;
  weeks: string;
}

export interface DbTime {
  start: string;
  end: string;
}
