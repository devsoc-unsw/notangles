export class UserSettingsDto {
    userID: string;
    is12HourMode: boolean;
    isDarkMode: boolean;
    isSquareEdges: boolean;
    isHideFullClasses: boolean;
    isDefaultUnscheduled: boolean;
    isHideClassInfo: boolean;
}

export class UserTimetableDataDto {
    userID: string;
    selectedCourses: string[];
    selectedClasses: Record<string, Record<string, string>>;
}