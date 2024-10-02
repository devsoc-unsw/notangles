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

// TODO: remove when gql integration is successful
// export interface FetchedCourse {
//   courseCode: CourseCode;
//   name: string;
//   online: boolean;
//   inPerson: boolean;
//   career: string;
//   faculty: string;
// }

// FOR GQL
export interface FetchedCourse {
  course_code: CourseCode;
  course_name: string;
  online: boolean;
  inPerson: boolean;
  career: string;
  faculty: string;
}
