import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';

export class UserSettingsDto {
  @IsBoolean()
  @IsNotEmpty()
  is12HourMode: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isDarkMode: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isSquareEdges: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isHideFullClasses: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isDefaultUnscheduled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isHideClassInfo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isSortAlphabetic: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isShowOnlyOpenClasses: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isHideExamClasses: boolean;

  @IsBoolean()
  @IsNotEmpty()
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

  @IsArray()
  @IsNotEmpty()
  selectedCourses: string[];

  @IsNotEmpty()
  selectedClasses: Record<string, Record<string, string>>;

  @IsArray()
  events: EventsDto[];
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

export class EventsDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  colour: string;

  @IsNotEmpty()
  @IsObject()
  time: {
    day: Number;
    start: Number;
    end: Number;
  };
}
