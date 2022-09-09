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
  timetableId: string;
  selectedCourses: string[];
  selectedClasses: Record<string, Record<string, string>>;
  events: Events[];
}

export class FriendRequestDto {
  userId: string;
  friendId: string;
  constructor(userId: string, friendId: string) {
    this.userId = userId;
    this.friendId = friendId;
  }
}

export class Events {
  id: string;
  name: string;
  location: string;
  description: string;
  color: string;
  time: {
    day: string;
    start: string;
    end: string;
  };
}
