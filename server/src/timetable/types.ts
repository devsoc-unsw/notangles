export class AddCourseDto {
  term: string;
  colour: string;
}
export class CourseDetails {
  id: string;
  selectedClasses: string[];
}

export class UserTimetable {
  id: string;
  name: string;
  year: number;
  term: string;
  primary: boolean;
}

export enum Term {
  U1 = 'U1',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
}
