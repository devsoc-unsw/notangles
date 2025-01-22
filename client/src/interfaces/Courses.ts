import { CourseCode } from './Periods';

export type CoursesList = CourseOverview[];
export interface CourseOverview {
  id: string;
  code: string;
  name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
  faculty: string;
}

export interface CoursesListWithDate {
  courses: CoursesList;
}

export interface FetchedCourse {
  course_id: string;
  course_code: CourseCode;
  course_name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
  faculty: string;
}
