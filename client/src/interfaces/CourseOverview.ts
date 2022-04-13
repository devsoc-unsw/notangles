import { CourseCode } from './Course';

export type CoursesList = CourseOverview[];
export interface CourseOverview {
  code: string;
  name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
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
}
