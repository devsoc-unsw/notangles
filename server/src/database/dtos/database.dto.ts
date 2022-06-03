export class UserSettingsDto {
    is12HourMode: boolean;
    isDarkMode: boolean;
    isSquareEdges: boolean;
    isHideFullClasses: boolean;
    isDefaultUnscheduled: boolean;
    isHideClassInfo: boolean;
}

export class UserTimetableDataDto {
    selectedCourses: string[];
    selectedClasses: Record<string, Record<string, string>>;
}