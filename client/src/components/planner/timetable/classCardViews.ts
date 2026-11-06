import type { TimetableClass } from '../../../api/times/times';
import { shortDayToIndex } from '../../../constants/timetable';
import { decodeColor } from '../../../utils/colors';
import { parseClassTimeRange } from '../../../utils/time';
import type { ClassCardIdentity } from './classCardKeys';
import { type ClassCardMetadata, getClassCardMetadata, type TimetableClassesView } from './useTimetableClasses';

export interface ClassCardView extends ClassCardIdentity {
  title: string;
  backgroundColor: string;
  details?: string;
  metadata?: ClassCardMetadata;
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  inventoryIndex?: number;
  draggable: boolean;
}

interface ClassCardViewOptions extends TimetableClassesView {
  classes: TimetableClass[];
  numberOfDays: number;
  earliestStartHour: number;
  preferredTheme: string;
  hideClassInfo: boolean;
}

export const buildClassCardViews = ({
  scheduledClasses,
  unscheduledActivities,
  unresolvedSelectedClassIds,
  classes,
  numberOfDays,
  earliestStartHour,
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
      title: `${classData.course.course_code} ${classData.activity}`,
      backgroundColor: decodeColor(course.colour, preferredTheme),
      draggable: true,
    };

    if (classData.times.length === 0) {
      unscheduled.push({
        ...base,
        timeIndex: null,
        gridColumn: numberOfDays + 3,
        details: hideClassInfo ? undefined : `${classData.section} · No scheduled time`,
      });
    }

    classData.times.forEach((time, timeIndex) => {
      const dayIndex = shortDayToIndex[time.day];
      const range = parseClassTimeRange(time.time);
      if (dayIndex === undefined || dayIndex >= numberOfDays || !range) return;
      views.push({
        ...base,
        timeIndex,
        dayIndex,
        startMinutes: range.startMinutes,
        gridColumn: dayIndex + 2,
        offsetMinutes: range.startMinutes - earliestStartHour * 60,
        durationMinutes: range.endMinutes - range.startMinutes,
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
      title: `${availableClasses[0].course.course_code} ${activity}`,
      backgroundColor: decodeColor(course.colour, preferredTheme),
      gridColumn: numberOfDays + 3,
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
      title: 'Selected class unavailable',
      backgroundColor: '#777777',
      gridColumn: numberOfDays + 3,
      details: hideClassInfo ? undefined : classId,
      draggable: false,
    });
  }
  return [...views, ...unscheduled.map((card, inventoryIndex) => ({ ...card, inventoryIndex }))];
};
