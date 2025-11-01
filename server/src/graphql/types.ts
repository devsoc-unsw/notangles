import { TimetableConstraints_PeriodInfo } from 'src/auto/proto/autotimetabler';
export class ClassDetails {
  activity: string;
  section: string;
}

export class AutoTimetablePayload {
  [activity: string]: AutoTimetableClass[];
}

class AutoTimetableClass {
  classId: string;
  periodInfo: TimetableConstraints_PeriodInfo;
}
