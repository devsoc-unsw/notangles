import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  courseId: string;
  @ApiProperty()
  timetableId: string;
}
export class AddCourseDto extends CourseDto {
  @ApiProperty()
  term: string;
  @ApiProperty()
  colour: string;
}
export class SetCourseColourDto extends CourseDto {
  @ApiProperty()
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
