// REST Interface
export interface Course {
  courseCode: string;
  name: string;
  school: string;
  faculty: string;
  campus: string;
  career: string;
  termsOffered: string[];
  censusDates: string[];
  classes: Class[];
}

interface Class {
  classID: number;
  section: string;
  term: string;
  activity: string;
  status: string;
  courseEnrolment: CourseEnrolment;
  termDates: TermDates;
  needsConsent: boolean;
  mode: string;
  times: ClassTime[];
  notes: string[];
}

interface CourseEnrolment {
  enrolments: number;
  capacity: number;
}

interface TermDates {
  start: string; // DD/MM/YYYY
  end: string; // DD/MM/YYYY
}

interface ClassTime {
  day: string; // e.g. Mon
  time: TimeSlot;
  weeks: string; // e.g. 1-5,7-10
  location: string;
  instructor: string;
}

interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
}
