import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassType } from '@prisma/client';

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
  courseCode: string; // Code + section will uniquely identify the class
  section: string;
  classType: ClassType;
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
