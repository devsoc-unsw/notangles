export class UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export class UserSettings {
  preferredTheme: string;
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  hideFullClasses: boolean;
  hideClassInfo: boolean;
  unscheduleClassesByDefault: boolean;
  hideExamClasses: boolean;
}

export class EventParameters {
  id: string;
  colour: string;
  dayOfWeek: number;
  start: number;
  end: number;
  type: EventType;
  timetableId: string;
}
