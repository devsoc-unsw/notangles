import { IsArray, IsString } from 'class-validator';

export class TimetableDto {
  @IsString()
  id: string; // Randomly generated on the backend

  @IsArray()
  @IsString({ each: true })
  selectedCourses: string[];
  selectedClasses: ClassDto[];
  createdEvents: EventDto[];
  name?: string;
}

export class ReconstructedTimetableDto {
  @IsString()
  id: string; // Randomly generated on the backend

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
  term: string;
  courseCode: string;
  timetableId?: string;
}

export class ClassTimeDto {
  day: string;
  time: {
    start: string;
    end: string;
  };
  weeks: string;
  location: string;
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
  times: ClassTimeDto[];
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
