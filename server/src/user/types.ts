export class UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export class UserSettings {
  preferredTheme: string;
  use24HourClock: boolean;
  useDarkMode: boolean;
  useSquareEdges: boolean;
  hideFullClasses: boolean;
  hideClassInfo: boolean;
  unscheduleClassesByDefault: boolean;
  hideExamClasses: boolean;
}

export class CourseDto {
  courseId: string;
  timetableId: string;
}
export class AddCourseDto extends CourseDto {
  term: string;
  colour: string;
}
export class SetCourseColourDto extends CourseDto {
  colour: string;
}

export class ClassDetails {
  course_id: string;
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

export class CourseDetails {
  id: string;
  courseId: string;
  timetableId: string;
  colour: string;
  selectedClasses: string[];
}
