export interface GQLCourseInfo {
  course_code: string;
  course_name: string;
  classes: {
    activity: string;
    status: string;
    course_enrolment: string;
    class_id: string;
    term: string;
    section: string;
    times: {
      day: string;
      time: string;
      weeks: string;
      location: string;
    }[];
  }[];
}

export type GQLCourseData = {
  data: {
    courses: GQLCourseInfo[];
  };
};
