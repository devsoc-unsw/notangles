import { useMemo, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { useUpdateSelectedClass } from '../../../api/timetable/mutations';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { assignClassCardKeys, type DraggedCardMapping } from './classCardKeys';
import { buildClassCardViews } from './classCardViews';
import { getClassDropSlots } from './classDropSlots';
import { useClassDrag } from './useClassDrag';
import { useTimetableClasses } from './useTimetableClasses';

interface DroppedClassesOptions {
  timetableId: string;
  courses: TimetableCourse[];
  classes: TimetableClass[];
  numberOfDays: number;
  earliestStartHour: number;
}

export const useDroppedClasses = ({
  timetableId,
  courses,
  classes,
  numberOfDays,
  earliestStartHour,
}: DroppedClassesOptions) => {
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

  const selectClass = (courseId: string, activity: string, classId: string | null) => {
    setSaveFailed(false);
    updateClass.mutate({ ...selectionGroup(courseId, activity), selectedClassId: classId });
  };

  // Connect to the dragging controller and generate candidate slots
  const {
    drag: dragState,
    startDrag,
    registerDropzone,
  } = useClassDrag(timetableId, {
    onDrop: (source, target) => {
      selectClass(source.courseId, source.activity, target.type === 'class' ? target.classId : null);
    },
  });

  const dragSource = dragState?.source;
  const dropTarget = dragState?.target;
  const dropSlots = useMemo(() => (dragSource ? getClassDropSlots(dragSource, classes) : []), [dragSource, classes]);
  // The class options being shown if the current class is dropped
  const previewCourses = useMemo(() => {
    if (!dragSource) return courses;
    const selectedClassId =
      dropTarget?.type === 'class'
        ? dropTarget.classId
        : dropTarget?.type === 'unscheduled'
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
  }, [courses, classes, dragSource, dropTarget]);

  // Transfer preview data to class cards
  const { scheduledClasses, unscheduledActivities, unresolvedSelectedClassIds } = useTimetableClasses(
    previewCourses,
    classes,
  );

  const cards = useMemo(
    () =>
      buildClassCardViews({
        scheduledClasses,
        unscheduledActivities,
        unresolvedSelectedClassIds,
        classes,
        numberOfDays,
        earliestStartHour,
        preferredTheme,
        hideClassInfo,
      }),
    [
      scheduledClasses,
      unscheduledActivities,
      unresolvedSelectedClassIds,
      classes,
      numberOfDays,
      earliestStartHour,
      preferredTheme,
      hideClassInfo,
    ],
  );

  const draggedCardMapping = useMemo<DraggedCardMapping | undefined>(
    () =>
      dragSource
        ? {
            sourceKey: dragSource.cardKey,
            targetClassId:
              dropTarget?.type === 'class'
                ? dropTarget.classId
                : dropTarget?.type === 'unscheduled'
                  ? null
                  : dragSource.classId,
            targetTimeIndex:
              dropTarget?.type === 'class'
                ? dropTarget.timeIndex
                : dropTarget?.type === 'unscheduled'
                  ? null
                  : dragSource.timeIndex,
          }
        : undefined,
    [dragSource, dropTarget],
  );

  // layout stores the previous batch of cards and their keys
  const [layout, setLayout] = useState(() => ({
    cards,
    draggedCardMapping,
    keyGeneration: 0,
    keyed: assignClassCardKeys([], cards, draggedCardMapping),
  }));

  let keyed = layout.keyed;
  if (layout.cards !== cards || layout.draggedCardMapping !== draggedCardMapping) {
    const keyGeneration = layout.keyGeneration + 1;
    keyed = assignClassCardKeys(layout.keyed, cards, draggedCardMapping, keyGeneration);
    setLayout({ cards, draggedCardMapping, keyGeneration, keyed });
  }

  const isPointerDragging = dragState?.phase === 'dragging';
  const dragColour =
    cards.find((card) => card.courseId === dragSource?.courseId && card.activity === dragSource.activity)
      ?.backgroundColor ?? '#777777';

  const handleSelectClass = (classData: TimetableClass, classId: string) => {
    selectClass(classData.course_id, classData.activity, classId);
  };

  return {
    cards: [...keyed].sort((a, b) => a.key.localeCompare(b.key)),
    dragState,
    isPointerDragging,
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
