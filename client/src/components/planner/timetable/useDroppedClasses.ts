import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { useUpdateSelectedClass } from '../../../api/timetable/mutations';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { enqueueSelectedClassChange } from '../../../api/timetable/selectedClassQueue';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { shortDayToIndex } from '../../../constants/timetable';
import { decodeColor } from '../../../utils/colors';
import { parseClassTimeRange } from '../../../utils/time';
import { type ClassCardIdentity, type DraggedCardMapping, reconcileClassCardKeys } from './classCardLayout';
import { getClassDropSlots, useClassDrag } from './useClassDrag';
import { type ClassCardMetadata, getClassCardMetadata, useTimetableClasses } from './useTimetableClasses';

interface DroppedClassesOptions {
  timetableId: string;
  courses: TimetableCourse[];
  classes: TimetableClass[];
  numberOfDays: number;
  earliestStartHour: number;
}

export interface ClassCardView extends ClassCardIdentity {
  title: string;
  backgroundColour: string;
  details?: string;
  metadata?: ClassCardMetadata;
  gridColumn: number;
  offsetMinutes?: number;
  durationMinutes?: number;
  inventoryIndex?: number;
  draggable: boolean;
}

export const useDroppedClasses = ({
  timetableId,
  courses,
  classes,
  numberOfDays,
  earliestStartHour,
}: DroppedClassesOptions) => {
  const queryClient = useQueryClient();
  const { preferredTheme, isSquareEdges, hideClassInfo } = useGetUserSettingsQuery();
  const [saveFailed, setSaveFailed] = useState(false);
  const updateClass = useUpdateSelectedClass(() => {
    setSaveFailed(true);
  });

  const selectionGroup = (courseId: string, activity: string) => ({
    timetableId,
    courseId,
    activity,
    activityClassIds: classes
      .filter((cls) => cls.course_id === courseId && cls.activity === activity)
      .map((cls) => cls.class_id),
  });

  const { drag, startDrag, registerDropzone } = useClassDrag(timetableId, {
    onDrop: (source, target) => {
      setSaveFailed(false);
      void enqueueSelectedClassChange(queryClient, {
        ...selectionGroup(source.courseId, source.activity),
        selectedClassId: target.type === 'class' ? target.classId : null,
      }).catch(() => {
        setSaveFailed(true);
      });
    },
  });

  const dragSource = drag?.source;
  const dragTarget = drag?.target;
  const dropSlots = useMemo(() => (dragSource ? getClassDropSlots(dragSource, classes) : []), [dragSource, classes]);
  // The class options being shown if the current class is dropped
  const previewCourses = useMemo(() => {
    if (!dragSource) return courses;
    const selectedClassId =
      dragTarget?.type === 'class'
        ? dragTarget.classId
        : dragTarget?.type === 'unscheduled'
          ? null
          : dragSource.classId;
    const activityIds = new Set(
      classes
        .filter((cls) => cls.course_id === dragSource.courseId && cls.activity === dragSource.activity)
        .map((cls) => cls.class_id),
    );
    return courses.map((course) => {
      if (course.courseId !== dragSource.courseId) return course;
      const selectedClasses = course.selectedClasses.filter((id) => !activityIds.has(id));
      if (selectedClassId !== null) selectedClasses.push(selectedClassId);
      return { ...course, selectedClasses };
    });
  }, [courses, classes, dragSource, dragTarget]);

  const { scheduledClasses, unscheduledActivities, unresolvedSelectedClassIds } = useTimetableClasses(
    previewCourses,
    classes,
  );

  const cards = useMemo(() => {
    const views: ClassCardView[] = [];
    const unscheduled: ClassCardView[] = [];
    // Generate a dropped class card for each class option
    for (const { course, classData } of scheduledClasses) {
      const base = {
        courseId: course.courseId,
        activity: classData.activity,
        classId: classData.class_id,
        title: `${classData.course.course_code} ${classData.activity}`,
        backgroundColour: decodeColor(course.colour, preferredTheme),
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
        backgroundColour: decodeColor(course.colour, preferredTheme),
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
        backgroundColour: '#777777',
        gridColumn: numberOfDays + 3,
        details: hideClassInfo ? undefined : classId,
        draggable: false,
      });
    }
    return [...views, ...unscheduled.map((card, inventoryIndex) => ({ ...card, inventoryIndex }))];
  }, [
    scheduledClasses,
    unscheduledActivities,
    unresolvedSelectedClassIds,
    classes,
    numberOfDays,
    earliestStartHour,
    preferredTheme,
    hideClassInfo,
  ]);

  const draggedCardMapping = useMemo<DraggedCardMapping | undefined>(
    () =>
      dragSource
        ? {
            sourceKey: dragSource.cardKey,
            targetClassId:
              dragTarget?.type === 'class'
                ? dragTarget.classId
                : dragTarget?.type === 'unscheduled'
                  ? null
                  : dragSource.classId,
            targetTimeIndex:
              dragTarget?.type === 'class'
                ? dragTarget.timeIndex
                : dragTarget?.type === 'unscheduled'
                  ? null
                  : dragSource.timeIndex,
          }
        : undefined,
    [dragSource, dragTarget],
  );

  const [layout, setLayout] = useState(() => ({
    cards,
    draggedCardMapping,
    keyed: reconcileClassCardKeys([], cards, draggedCardMapping),
  }));
  let keyed = layout.keyed;
  if (layout.cards !== cards || layout.draggedCardMapping !== draggedCardMapping) {
    keyed = reconcileClassCardKeys(layout.keyed, cards, draggedCardMapping);
    setLayout({ cards, draggedCardMapping, keyed });
  }
  const dragging = drag?.phase === 'dragging';
  const dragColour =
    cards.find((card) => card.courseId === dragSource?.courseId && card.activity === dragSource.activity)
      ?.backgroundColour ?? '#777777';

  const handleSelectClass = (classData: TimetableClass, classId: string) => {
    setSaveFailed(false);
    updateClass.mutate({
      ...selectionGroup(classData.course_id, classData.activity),
      classId,
    });
  };

  return {
    cards: [...keyed].sort((a, b) => a.key.localeCompare(b.key)),
    drag,
    dragging,
    dragColour,
    dropSlots,
    isSquareEdges,
    startDrag,
    registerDropzone,
    handleSelectClass,
    saveFailed,
    dismissSaveError: () => {
      setSaveFailed(false);
    },
  };
};
