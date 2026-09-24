export class UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
  profilePictureUrl?: string;
  isGuest: boolean;
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
