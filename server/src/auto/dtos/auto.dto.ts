import { TimetableConstraints, TimetableConstraints_PeriodInfo } from './auto';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class TimetableConstraintsDto implements TimetableConstraints {
  @IsNumber()
  @IsNotEmpty()
  start: number;

  @IsNumber()
  @IsNotEmpty()
  end: number;

  @IsString()
  @IsNotEmpty()
  days: string;

  @IsNumber()
  @IsNotEmpty()
  gap: number;

  @IsNumber()
  @IsNotEmpty()
  maxdays: number;

  @IsArray()
  @IsNotEmpty()
  periodInfo: PeriodInfoDto[];
}

export class PeriodInfoDto implements TimetableConstraints_PeriodInfo {
  @IsNumber()
  @IsNotEmpty()
  periodsPerClass: number;

  @IsArray()
  @IsNotEmpty()
  periodTimes: number[];

  @IsArray()
  @IsNotEmpty()
  durations: number[];
}
