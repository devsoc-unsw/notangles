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

export class ReconstructedTimetableDto {
  @IsString()
  timetableId: string; // Randomly generated on the backend

  @IsArray()
  @IsString({ each: true })
  selectedCourses: string[];
  selectedClasses: ScrapedClassDto[];
  createdEvents: EventDto[];
  name?: string;
}

export class ClassDto {
  id: string;
  classNo: string; // From scraper
  year: string;
  term: 'T1' | 'T2' | 'T3' | 'U1';
  courseCode: string;
  timetableId?: string;
}

// Get class from scraper
export class ScrapedClassDto {
  classID: number;
  section: string;
  term: string;
  activity: string;
  status: string;
  courseEnrolment: {
    enrolments: number;
    capacity: number;
  };
  termDates: {
    start: string;
    end: string;
  };
  needsConsent: boolean;
  mode: string;
  times: any[]; // Change later but im lazy
  notes: [];
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
