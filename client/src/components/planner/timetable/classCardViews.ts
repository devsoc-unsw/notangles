import type { TimetableClass } from '../../../api/times/times';
import { shortDayToIndex } from '../../../constants/timetable';
import type { ClassCard, UnscheduledCard } from '../../../interfaces/Timetable';
import { decodeColor } from '../../../utils/colors';
import { tryParseClassTimeRange, weeksStringToArray } from '../../../utils/time';
import type { ClassCardIdentity } from './classCardKeys';
import { type ClassCardMetadata, getClassCardMetadata, type TimetableClassesView } from './useTimetableClasses';

export type ClassCardView = (ClassCard | UnscheduledCard) &
  ClassCardIdentity & {
    details?: string;
    metadata?: ClassCardMetadata;
    inventoryIndex?: number;
    draggable: boolean;
  };

interface ClassCardViewOptions extends TimetableClassesView {
  classes: TimetableClass[];
  numberOfDays: number;
  preferredTheme: string;
  hideClassInfo: boolean;
}

export const buildClassCardViews = ({
  scheduledClasses,
  unscheduledActivities,
  unresolvedSelectedClassIds,
  classes,
  numberOfDays,
  preferredTheme,
  hideClassInfo,
}: ClassCardViewOptions): ClassCardView[] => {
  const views: ClassCardView[] = [];
  const unscheduled: ClassCardView[] = [];

  // Generate a dropped class card for each class option
  for (const { course, classData } of scheduledClasses) {
    const base = {
      courseId: course.courseId,
      activity: classData.activity,
      classId: classData.class_id,
      name: `${classData.course.course_code} ${classData.activity}`,
      color: decodeColor(course.colour, preferredTheme),
      draggable: true,
    };

    if (classData.times.length === 0) {
      unscheduled.push({
        ...base,
        timeIndex: null,
        type: 'unscheduled',
        details: hideClassInfo ? undefined : `${classData.section} · No scheduled time`,
      });
    }

    classData.times.forEach((time, timeIndex) => {
      const dayIndex = shortDayToIndex[time.day];
      const result = tryParseClassTimeRange(time.time, classData.class_id);
      if (!result.ok) {
        unscheduled.push({
          ...base,
          timeIndex,
          type: 'unscheduled',
          details: 'Time unavailable',
          draggable: false,
        });
        return;
      }

      const range = result.value;
      if (dayIndex >= numberOfDays) return;
      views.push({
        ...base,
        timeIndex,
        dayIndex,
        startMinutes: range.startMinutes,
        type: 'class',
        time: {
          day: dayIndex,
          start: range.startMinutes,
          end: range.endMinutes,
          weeks: weeksStringToArray(time.weeks),
        },
        metadata: hideClassInfo ? undefined : getClassCardMetadata(classData, timeIndex, classes),
      });
    });
  }

  // If no class is scheduled, a class card should be added to the unscheduled area
  for (const { course, activity, availableClasses } of unscheduledActivities) {
    unscheduled.push({
      courseId: course.courseId,
      activity,
      classId: null,
      timeIndex: null,
      name: `${availableClasses[0].course.course_code} ${activity}`,
      color: decodeColor(course.colour, preferredTheme),
      type: 'unscheduled',
      draggable: true,
      details: hideClassInfo
        ? undefined
        : `${availableClasses.length.toString()} available class${availableClasses.length === 1 ? '' : 'es'}`,
    });
  }

  for (const classId of unresolvedSelectedClassIds) {
    unscheduled.push({
      courseId: '',
      activity: classId,
      classId,
      timeIndex: null,
      name: 'Selected class unavailable',
      color: '#777777',
      type: 'unscheduled',
      details: hideClassInfo ? undefined : classId,
      draggable: false,
    });
  }
  return [...views, ...unscheduled.map((card, inventoryIndex) => ({ ...card, inventoryIndex }))];
};
