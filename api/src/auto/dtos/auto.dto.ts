export class AutoDto {
  readonly start: number;
  readonly end: number;
  readonly days: string;
  readonly gap: number;
  readonly maxdays: number;
  readonly periodInfoList: {
    readonly periodsPerClass: number;
    readonly periodTimes: Array<number>;
    readonly durations: Array<number>;
  }[];
}
