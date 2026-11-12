export class autoDTO {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodInfoList: {
    periodsPerClass: number;
    periodTimes: Array<number>;
    durations: Array<number>;
  }[];
}
