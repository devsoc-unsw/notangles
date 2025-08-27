export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface UserSettings {
  preferredTheme: string;
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  hideFullClasses: boolean;
  hideClassInfo: boolean;
  unscheduleClassesByDefault: boolean;
  hideExamClasses: boolean;
  convertToLocalTimezone: boolean;
}
