interface Time {
  __typename: 'times';
  day: string;
  time: string;
  weeks: string;
  location: string;
  instructor: string;
}

interface CourseDetails {
  __typename: 'courses';
  course_name: string;
  modes: string[];
}

interface Class {
  __typename: 'classes';
  activity: string;
  class_id: string;
  course_id: string;
  course: CourseDetails;
  status: string;
  course_enrolment: string;
  section: string;
  term: string;
  consent: string;
  times: Time[];
}

interface Course {
  __typename: 'courses';
  course_code: string;
  course_name: string;
  classes: Class[];
  school: string;
  faculty: string;
  campus: string;
  career: string;
  terms: string;
}

interface CoursesData {
  courses: Course[];
}

export interface QueryResponse {
  data: CoursesData;
  loading: boolean;
  networkStatus: number;
}
