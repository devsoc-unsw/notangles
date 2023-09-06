export class TimetableDto {
  timetableId: string; // Randomly generated on the backend
  selectedCourses: string[];
  events: EventDto[];
}

export class EventDto {
  id: string; // Frontend generated event id
  name: string;
  location: string;
  description: string;
  colour: string;
}
