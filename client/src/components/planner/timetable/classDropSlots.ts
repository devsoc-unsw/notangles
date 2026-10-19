import type { TimetableClass } from '../../../api/times/times';
import { shortDayToIndex } from '../../../constants/timetable';
import { parseClassTimeRange } from '../../../utils/time';

export interface ClassDropSource {
  courseId: string;
  activity: string;
  classId: string | null;
  timeIndex: number | null;
}

export interface ClassDropSlot {
  id: string;
  classData: TimetableClass;
  timeIndex: number;
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  locations: string[];
}

type Period = Pick<ClassDropSlot, 'dayIndex' | 'startMinutes' | 'endMinutes'>;
const areDuplicatePeriods = (a: Period, b: Period) =>
  a.dayIndex === b.dayIndex && a.startMinutes === b.startMinutes && a.endMinutes === b.endMinutes;

export const getClassDropSlots = (source: ClassDropSource, classes: TimetableClass[]): ClassDropSlot[] => {
  const sourceClass = classes.find((cls) => cls.class_id === source.classId);
  const durations = sourceClass?.times.map((time) => {
    const range = parseClassTimeRange(time.time);
    return range ? range.endMinutes - range.startMinutes : undefined;
  });
  const sourceDuration = source.timeIndex === null ? undefined : durations?.[source.timeIndex];
  const equalDurations = durations?.every((duration) => duration !== undefined && duration === durations[0]);
  const slots: ClassDropSlot[] = [];
  const candidates = classes
    .filter((cls) => cls.course_id === source.courseId && cls.activity === source.activity)
    .sort(
      (a, b) =>
        Number(b.class_id === source.classId) - Number(a.class_id === source.classId) ||
        a.class_id.localeCompare(b.class_id),
    );

  for (const classData of candidates) {
    classData.times.forEach((time, timeIndex) => {
      const dayIndex = shortDayToIndex[time.day];
      const classRange = parseClassTimeRange(time.time);
      if (dayIndex === undefined || !classRange) return;
      if (
        source.timeIndex !== null &&
        sourceDuration !== classRange.endMinutes - classRange.startMinutes &&
        !equalDurations
      )
        return;

      const period = { dayIndex, ...classRange };
      const duplicate = slots.find((slot) => areDuplicatePeriods(slot, period));
      if (duplicate) {
        duplicate.locations.push(time.location);
        return;
      }
      const id = `${dayIndex.toString()}-${classRange.startMinutes.toString()}-${classRange.endMinutes.toString()}`;
      slots.push({ id, classData, timeIndex, ...period, locations: [time.location] });
    });
  }
  return slots;
};
