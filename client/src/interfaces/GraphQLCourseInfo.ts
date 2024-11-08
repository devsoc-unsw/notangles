interface Time {
  __typename: 'times';
  day: string;
  time: string;
  weeks: string;
  location: string;
}

interface Class {
  __typename: 'classes';
  activity: string;
  status: string;
  course_enrolment: string;
  section: string;
  times: Time[];
  term: string;
  class_id: string;
}

interface Course {
  __typename: 'courses';
  course_code: string;
  course_name: string;
  classes: Class[];
}

interface CoursesData {
  courses: Course[];
}

export interface GraphQLCourse {
  data: CoursesData;
  loading: boolean;
  networkStatus: number;
}
