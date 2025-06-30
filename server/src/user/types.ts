export class UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export class UserSettings {
  preferredTheme: string;
  use24HourClock: boolean;
  useDarkMode: boolean;
  useSquareEdges: boolean;
  hideFullClasses: boolean;
  hideClassInfo: boolean;
  unscheduleClassesByDefault: boolean;
  hideExamClasses: boolean;
}

export class UserTimetable {
  id: string;
  name: string;
  year: number;
  term: string;
  primary: boolean;
}
