import { EventType } from '../generated/prisma/enums';

export class AddCourseDto {
  term: string;
  colour: string;
}

export class CourseDetails {
  id: string;
  selectedClasses: string[];
}

export class TimetableCourse {
  courseId: string;
  colour: string;
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

export class EditEventParametersDto {
  colour: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  start: number; // Mins since midnight
  end: number; // Mins since midnight
  title: string;
  description?: string;
  location?: string;
}

export class EventParametersDto extends EditEventParametersDto {
  type: EventType;
}
