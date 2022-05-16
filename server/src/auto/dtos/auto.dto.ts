import { ApiProperty } from '@nestjs/swagger';
import { TimetableConstraints, TimetableConstraints_PeriodInfo } from'./auto';

export class TimetableConstraintsDto implements TimetableConstraints {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodInfo: PeriodInfoDto[];
}

export class PeriodInfoDto implements TimetableConstraints_PeriodInfo {
  periodsPerClass: number;
  periodTimes: number[];
  durations: number[];
}