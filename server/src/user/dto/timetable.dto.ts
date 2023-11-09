import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimetableDto {
  @IsString()
  timetableId: string; // Randomly generated on the backend
  @IsString()
  name: string;
  @IsArray()
  @IsString({ each: true })
  selectedCourses: string[];
  selectedClasses: ClassDto[];
  events: EventDto[];
}

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

export class ClassDto {
  id: string;
  classType: string;
  courseName: string;
}
