export enum ClassMode {
  hybrid = 'hybrid',
  'in person' = 'in person',
  online = 'online',
}

export class ConstraintDTO {
  startHour: number;
  endHour: number;
  selectedDaysStr: string;
  breaksBetweenClasses: number;
  daysAtUni: number;
  mode: ClassMode;
}
