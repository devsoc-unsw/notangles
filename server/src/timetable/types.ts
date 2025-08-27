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
