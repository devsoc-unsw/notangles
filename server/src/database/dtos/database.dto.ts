export class UserSettingsDto {
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  isHideFullClasses: boolean;
  isDefaultUnscheduled: boolean;
  isHideClassInfo: boolean;

  constructor(
    is12HourMode: boolean,
    isDarkMode: boolean,
    isSquareEdges: boolean,
    isHideFullClasses: boolean,
    isDefaultUnscheduled: boolean,
    isHideClassInfo: boolean,
  ) {
    this.is12HourMode = is12HourMode;
    this.isDarkMode = isDarkMode;
    this.isSquareEdges = isSquareEdges;
    this.isHideFullClasses = isHideFullClasses;
    this.isDefaultUnscheduled = isDefaultUnscheduled;
    this.isHideClassInfo = isHideClassInfo;
  }
}

export class UserTimetablesDto {
  selectedCourses: string[];
  selectedClasses: Record<string, Record<string, string>>;
}
