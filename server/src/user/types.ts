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
export class CourseDetails {
  id: string;
  selectedClasses: string[];
}
