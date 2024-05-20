import { CourseCode } from './Periods';

export type CoursesList = CourseOverview[];
export interface CourseOverview {
  code: string;
  name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
  faculty: string;
}

export interface CoursesListWithDate {
  lastUpdated: number;
  courses: CoursesList;
}

export interface FetchedCourse {
  courseCode: CourseCode;
  name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
  faculty: string;
}