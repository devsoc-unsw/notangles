export type CoursesList = CourseOverview[];
export interface CourseOverview {
  code: string
  name: string
  online: boolean
  inPerson: boolean
}

export interface CoursesListWithDate {
  lastUpdated: number;
  courses: CoursesList;
}

export interface FetchedCourse {
  courseCode: string;
  name: string;
  online: boolean;
  inPerson: boolean;
}
