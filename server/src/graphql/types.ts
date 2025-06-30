export class ClassDetails {
  activity: string;
  career?: string | null | undefined;
  course_enrolment: string;
  mode: string;
  offering_period: string;
  section: string;
  status?: string;
  term: string;
  times: ClassTime[];
  year: string;
}

export class ClassTime {
  day: string;
  location: string;
  time: string;
  weeks: string;
}
