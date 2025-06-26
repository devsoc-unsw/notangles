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
export class AddCourseDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  term: string;

  @ApiProperty()
  timetableId: string;

  @ApiProperty()
  colour: string;
}

export class RemoveCourseDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  timetableId: string;
}

export class SetCourseColourDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  timetableId: string;

  @ApiProperty()
  colour: string;
}
