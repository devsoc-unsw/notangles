import { EventType } from '../generated/prisma/enums';

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

export class EventParametersDto {
  colour: string;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  start: number; // Mins since midnight
  end: number; // Mins since midnight
  type: EventType;
  title: string;
  description?: string;
  location?: string;
}
