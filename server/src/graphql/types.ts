export class ClassDetails {
  activity: string;
  section: string;
  times: {
    day: string;
    time: string;
    weeks: string;
    location: string;
  }[];
  offering_period: string;
  course: {
    course_code: string;
    course_name: string;
  };
}
