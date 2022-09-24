export class UserSettingsDto {
  is12HourMode: boolean;
  isDarkMode: boolean;
  isSquareEdges: boolean;
  isHideFullClasses: boolean;
  isDefaultUnscheduled: boolean;
  isHideClassInfo: boolean;
  isSortAlphabetic: boolean;
  isShowOnlyOpenClasses: boolean;
  isHideExamClasses: boolean;
  isConvertToLocalTimezone: boolean;

  constructor(
    is12HourMode: boolean,
    isDarkMode: boolean,
    isSquareEdges: boolean,
    isHideFullClasses: boolean,
    isDefaultUnscheduled: boolean,
    isHideClassInfo: boolean,
    isSortAlphabetic: boolean,
    isShowOnlyOpenClasses: boolean,
    isHideExamClasses: boolean,
    isConvertToLocalTimezone: boolean,
  ) {
    this.is12HourMode = is12HourMode;
    this.isDarkMode = isDarkMode;
    this.isSquareEdges = isSquareEdges;
    this.isHideFullClasses = isHideFullClasses;
    this.isDefaultUnscheduled = isDefaultUnscheduled;
    this.isHideClassInfo = isHideClassInfo;
    this.isSortAlphabetic = isSortAlphabetic;
    this.isShowOnlyOpenClasses = isShowOnlyOpenClasses;
    this.isHideExamClasses = isHideExamClasses;
    this.isConvertToLocalTimezone = isConvertToLocalTimezone;
  }
}

export class UserTimetablesDto {
  timetableId: string;
  selectedCourses: string[];
  selectedClasses: Record<string, Record<string, string>>;
  events: Events[];
}

/**
 * Interface information:
 *
 * The sub is the google id of the user.
 * The name fields are self explanatory and the email
 * is the email address that is supported by the auth provider.
 * Note this is not defensively checked and is assumed to be checked
 * by the auth provider.
 * The picture is the url of the profile picture of the user, supplied
 * by the provider.
 */
export interface UserAuthInformation {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
}

export class Events {
  id: string;
  type: string;
  name: string;
  location: string;
  description: string;
  color: string;
  time: {
    day: Number;
    start: Number;
    end: Number;
  };
}
