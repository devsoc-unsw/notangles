import { Alert, Snackbar } from '@mui/material';
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
import ClassCard from './ClassCard';
import { type ClassCardIdentity, type ClassCardKeyAnchor, reconcileClassCardKeys } from './classCardLayout';
import ClassDropzone from './ClassDropzone';
import ExpandedClassView from './ExpandedClassView';
import { getClassDropSlots, useClassDrag } from './useClassDrag';
import { type ClassCardMetadata, getClassCardMetadata, useTimetableClasses } from './useTimetableClasses';

interface TimetableClassesProps {
  timetableId: string;
  courses: TimetableCourse[];
  classes: TimetableClass[];
  dayCount: number;
  earliestStartHour: number;
}

interface CardView extends ClassCardIdentity {
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

const TimetableClasses = ({ timetableId, courses, classes, dayCount, earliestStartHour }: TimetableClassesProps) => {
  const queryClient = useQueryClient();
  const { preferredTheme, isSquareEdges, hideClassInfo } = useGetUserSettingsQuery();
  const [saveFailed, setSaveFailed] = useState(false);
  const updateClass = useUpdateSelectedClass(() => {
    setSaveFailed(true);
  });
  const [expandedClass, setExpandedClass] = useState<{ classId: string; timeIndex: number | null } | null>(null);
  const expandedClassData = classes.find((cls) => cls.class_id === expandedClass?.classId);
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
    const views: CardView[] = [];
    const unscheduled: CardView[] = [];
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
          gridColumn: dayCount + 3,
          details: hideClassInfo ? undefined : `${classData.section} · No scheduled time`,
        });
      }
      classData.times.forEach((time, timeIndex) => {
        const dayIndex = shortDayToIndex[time.day];
        const range = parseClassTimeRange(time.time);
        if (dayIndex === undefined || dayIndex >= dayCount || !range) return;
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

    for (const { course, activity, availableClasses } of unscheduledActivities) {
      unscheduled.push({
        courseId: course.courseId,
        activity,
        classId: null,
        timeIndex: null,
        title: `${availableClasses[0].course.course_code} ${activity}`,
        backgroundColour: decodeColor(course.colour, preferredTheme),
        gridColumn: dayCount + 3,
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
        gridColumn: dayCount + 3,
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
    dayCount,
    earliestStartHour,
    preferredTheme,
    hideClassInfo,
  ]);

  const anchor = useMemo<ClassCardKeyAnchor | undefined>(
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

  const [layout, setLayout] = useState(() => ({ cards, anchor, keyed: reconcileClassCardKeys([], cards, anchor) }));
  let keyed = layout.keyed;
  if (layout.cards !== cards || layout.anchor !== anchor) {
    keyed = reconcileClassCardKeys(layout.keyed, cards, anchor);
    setLayout({ cards, anchor, keyed });
  }
  const dragging = drag?.phase === 'dragging';
  const dragColour =
    cards.find((card) => card.courseId === dragSource?.courseId && card.activity === dragSource.activity)
      ?.backgroundColour ?? '#777777';

  return (
    <>
      {[...keyed]
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(
          ({ key, courseId, activity, classId, timeIndex, draggable, dayIndex: _, startMinutes: __, ...cardProps }) => (
            <ClassCard
              key={key}
              cardKey={key}
              {...cardProps}
              dayCount={dayCount}
              squareEdges={isSquareEdges}
              isElevated={dragging && dragSource?.courseId === courseId && dragSource.activity === activity}
              onPointerDown={
                draggable
                  ? (event) => {
                      startDrag(event, { cardKey: key, courseId, activity, classId, timeIndex });
                    }
                  : undefined
              }
              onExpand={
                classId && !drag
                  ? () => {
                      setExpandedClass({ classId, timeIndex });
                    }
                  : undefined
              }
            />
          ),
        )}
      {dragging && (
        <>
          {dropSlots
            .filter((slot) => slot.dayIndex < dayCount)
            .map((slot) => (
              <ClassDropzone
                key={slot.id}
                gridColumn={slot.dayIndex + 2}
                offsetMinutes={slot.startMinutes - earliestStartHour * 60}
                durationMinutes={slot.endMinutes - slot.startMinutes}
                backgroundColour={dragColour}
                squareEdges={isSquareEdges}
                highlighted={
                  dragTarget?.type === 'class' &&
                  dragTarget.classId === slot.classData.class_id &&
                  dragTarget.timeIndex === slot.timeIndex
                }
                location={slot.classData.times[slot.timeIndex].location}
                label={`${slot.classData.course.course_code} ${slot.classData.activity} ${slot.classData.section}`}
                elementRef={(element) => {
                  registerDropzone(slot.id, element, {
                    type: 'class',
                    classId: slot.classData.class_id,
                    timeIndex: slot.timeIndex,
                    slotId: slot.id,
                  });
                }}
              />
            ))}
          <ClassDropzone
            gridColumn={dayCount + 3}
            backgroundColour={dragColour}
            squareEdges={isSquareEdges}
            highlighted={dragTarget?.type === 'unscheduled'}
            isUnscheduled
            label="Unscheduled drop target"
            elementRef={(element) => {
              registerDropzone('unscheduled', element, { type: 'unscheduled' });
            }}
          />
        </>
      )}
      {expandedClass && expandedClassData && (
        <ExpandedClassView
          key={[expandedClass.classId, expandedClass.timeIndex].join('-')}
          classData={expandedClassData}
          classes={classes}
          timeIndex={expandedClass.timeIndex}
          handleClose={(classId) => {
            if (classId !== expandedClassData.class_id) {
              setSaveFailed(false);
              updateClass.mutate({
                ...selectionGroup(expandedClassData.course_id, expandedClassData.activity),
                classId,
              });
            }
            setExpandedClass(null);
          }}
        />
      )}
      <Snackbar
        open={saveFailed}
        autoHideDuration={6000}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') setSaveFailed(false);
        }}
      >
        <Alert
          severity="error"
          onClose={() => {
            setSaveFailed(false);
          }}
        >
          Could not save your class selection. Please try again.
        </Alert>
      </Snackbar>
    </>
  );
};

export default TimetableClasses;
