export class UserSettingsDto {
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  isHideFullClasses: boolean;
  isDefaultUnscheduled: boolean;
  isHideClassInfo: boolean;
}

export class UserTimetablesDto {
  selectedCourses: string[];
  selectedClasses: Record<string, Record<string, string>>;
}
