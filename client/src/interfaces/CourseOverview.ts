export type CoursesList = CourseOverview[];
export interface CourseOverview {
  id: string
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
  _id: string;
  courseCode: string;
  name: string;
}
