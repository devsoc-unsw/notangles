import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimetableDto {
  @IsString()
  timetableId: string; // Randomly generated on the backend

  @IsArray()
  @IsString({ each: true })
  selectedCourses: string[];
  selectedClasses: ClassDto[];
  createdEvents: EventDto[];
  name?: string;
}

export class ClassDto {
  id: string;
  classNo: string; // From scraper
  timetableId?: string;
}

// Get class from scraper
export class ReconstructedClassDto {
  id: string;
  courseCode: string;
  courseName: string;
  activity: string;
  status: string;
  enrolments: number;
  capacity: number;
  periods: any[]; // Could change later to ClassPeriod
  section: string;
}

// export interface ClassPeriod {
//   type: 'class';
//   classId: string;
//   courseCode: CourseCode;
//   activity: Activity;
//   subActivity: string;
//   time: ClassTime;
//   locations: string[];
// }

export class EventDto {
  id: string; // Frontend generated event id
  name: string;
  location: string;
  description: string;
  colour: string;
  day: string;
  start: Date;
  end: Date;
}
