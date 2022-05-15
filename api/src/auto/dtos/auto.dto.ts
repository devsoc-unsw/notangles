import { ApiProperty } from '@nestjs/swagger';

export class AutoDto {
  @ApiProperty()
  readonly start: number;
  @ApiProperty()
  readonly end: number;
  @ApiProperty()
  readonly days: string;
  @ApiProperty()
  readonly gap: number;
  @ApiProperty()
  readonly maxdays: number;
  @ApiProperty()
  readonly periodInfoList: {
    readonly periodsPerClass: number;
    readonly periodTimes: Array<number>;
    readonly durations: Array<number>;
  }[];
}
