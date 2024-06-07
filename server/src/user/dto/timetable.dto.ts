import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimetableDto {
  @IsString()
  timetableId: string; // Randomly generated on the backend

  @IsArray()
  @IsString({ each: true })
  selectedCourses: string[];
  selectedClasses: ClassDto[];
  events: EventDto[];
  name?: string;
}

export class ClassDto {
  id?: string; // TODO: double check (currently optional, if generated on the backend during creation of timetable)
  classType: string;
  courseName?: string;
  timetableId?: string;
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
