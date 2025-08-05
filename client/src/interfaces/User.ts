export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface UserSettings {
  preferredTheme: string;
  use24HourClock: boolean;
  useDarkMode: boolean;
  useSquareEdges: boolean;
  hideFullClasses: boolean;
  hideClassInfo: boolean;
  unscheduleClassesByDefault: boolean;
  hideExamClasses: boolean;
  convertToLocalTimezone: boolean;
}
