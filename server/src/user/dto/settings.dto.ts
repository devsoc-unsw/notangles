import { IsBoolean } from 'class-validator';

export class SettingsDto {
  @IsBoolean() is12HourMode: boolean;
  @IsBoolean() isDarkMode: boolean;
  @IsBoolean() isSquareEdges: boolean;
  @IsBoolean() isHideFullClasses: boolean;
  @IsBoolean() isDefaultUnscheduled: boolean;
  @IsBoolean() isHideClassInfo: boolean;
  @IsBoolean() isSortAlphabetic: boolean;
  @IsBoolean() isShowOnlyOpenClasses: boolean;
  @IsBoolean() isHideExamClasses: boolean;
  @IsBoolean() isConvertToLocalTimezone: boolean;
}
