import { Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import type { TimetableClass } from '../../../api/times/times';
import {
  selectedClassMutationKey,
  useRemoveSelectedClass,
  useUpdateSelectedClass,
} from '../../../api/timetable/mutations';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { shortDayToIndex } from '../../../constants/timetable';
import { decodeColor } from '../../../utils/colors';
import { parseClassTimeRange } from '../../../utils/time';
import ClassCard from './ClassCard';
import ClassDropzone from './ClassDropzone';
import ExpandedClassView from './ExpandedClassView';
import { type ClassDragSource, getClassDropSlots, useClassDrag } from './useClassDrag';
import { getClassCardMetadata, useTimetableClasses } from './useTimetableClasses';

const UnscheduledColumn = styled('div')`
  display: contents;
`;

interface TimetableClassesProps {
  timetableId: string;
  courses: TimetableCourse[];
  classes: TimetableClass[];
  dayCount: number;
  earliestStartHour: number;
}

const TimetableClasses = ({ timetableId, courses, classes, dayCount, earliestStartHour }: TimetableClassesProps) => {
  const { preferredTheme, isSquareEdges, hideClassInfo } = useGetUserSettingsQuery();
  const { scheduledClasses, unscheduledActivities, unresolvedSelectedClassIds } = useTimetableClasses(courses, classes);
  const queryClient = useQueryClient();
  const updateClass = useUpdateSelectedClass();
  const removeClass = useRemoveSelectedClass();
  const isSaving = useIsMutating({ mutationKey: selectedClassMutationKey }) > 0;
  const [saveFailed, setSaveFailed] = useState(false);
  const [expandedClass, setExpandedClass] = useState<{ classId: string; timeIndex: number | null } | null>(null);
  const expandedClassData = scheduledClasses.find(
    ({ classData }) => classData.class_id === expandedClass?.classId,
  )?.classData;

  const canDrag = () => queryClient.isMutating({ mutationKey: selectedClassMutationKey }) === 0;
  const { drag, startDrag, registerDropzone } = useClassDrag(timetableId, {
    canDrag,
    onDrop: (source, target) => {
      if (!canDrag()) return;
      setSaveFailed(false);
      const options = {
        onError: () => {
          setSaveFailed(true);
        },
      };
      const params = { timetableId, courseId: source.courseId };
      if (target.type === 'class') {
        updateClass.mutate({ ...params, classId: target.classId, previousClassId: source.classId }, options);
      } else if (source.classId !== null) {
        removeClass.mutate({ ...params, classId: source.classId }, options);
      }
    },
  });
  const dropSlots = drag ? getClassDropSlots(drag.source, classes) : [];
  const isDragSource = (courseId: string, activity: string) =>
    drag?.source.courseId === courseId && drag.source.activity === activity;
  const makeSource = (
    course: TimetableCourse,
    cls: TimetableClass,
    classId: string | null,
    timeIndex: number | null,
  ): ClassDragSource => ({
    courseId: course.courseId,
    activity: cls.activity,
    classId,
    timeIndex,
    title: `${cls.course.course_code} ${cls.activity}`,
    metadata: hideClassInfo || timeIndex === null ? undefined : getClassCardMetadata(cls, timeIndex, classes),
    backgroundColour: decodeColor(course.colour, preferredTheme),
  });

  const noTimeClasses = scheduledClasses.filter(({ classData }) => classData.times.length === 0);
  const unscheduledCards = [
    ...unscheduledActivities.map(({ course, activity, availableClasses }) => {
      const firstClass = availableClasses[0];
      return {
        key: `${course.courseId}-${activity}`,
        source: makeSource(course, firstClass, null, null),
        backgroundColour: decodeColor(course.colour, preferredTheme),
        title: `${firstClass.course.course_code} ${activity}`,
        details: hideClassInfo
          ? undefined
          : [availableClasses.length, `available class${availableClasses.length === 1 ? '' : 'es'}`].join(' '),
      };
    }),

    ...noTimeClasses.map(({ course, classData }) => ({
      key: `${classData.class_id}-no-time`,
      source: makeSource(course, classData, classData.class_id, null),
      backgroundColour: decodeColor(course.colour, preferredTheme),
      title: `${classData.course.course_code} ${classData.activity}`,
      details: hideClassInfo ? undefined : `${classData.section} · No scheduled time`,
    })),

    ...unresolvedSelectedClassIds.map((classId) => ({
      key: classId,
      source: null,
      backgroundColour: '#777777',
      title: 'Selected class unavailable',
      details: hideClassInfo ? undefined : classId,
    })),
  ];

  return (
    <>
      {scheduledClasses.flatMap(({ course, classData }) =>
        classData.times.flatMap((classTime, index) => {
          const dayIndex = shortDayToIndex[classTime.day];
          const timeRange = parseClassTimeRange(classTime.time);
          if (dayIndex === undefined || dayIndex >= dayCount || !timeRange) return [];

          return (
            <ClassCard
              key={[classData.class_id, classTime.day, classTime.time, index].join('-')}
              gridColumn={dayIndex + 2}
              offsetMinutes={timeRange.startMinutes - earliestStartHour * 60}
              durationMinutes={timeRange.endMinutes - timeRange.startMinutes}
              backgroundColour={decodeColor(course.colour, preferredTheme)}
              squareEdges={isSquareEdges}
              title={`${classData.course.course_code} ${classData.activity}`}
              metadata={hideClassInfo ? undefined : getClassCardMetadata(classData, index, classes)}
              isDragSource={isDragSource(course.courseId, classData.activity)}
              onExpand={
                drag
                  ? undefined
                  : () => {
                      setExpandedClass({ classId: classData.class_id, timeIndex: index });
                    }
              }
              onPointerDown={
                isSaving
                  ? undefined
                  : (event) => {
                      startDrag(event, makeSource(course, classData, classData.class_id, index));
                    }
              }
            />
          );
        }),
      )}

      <UnscheduledColumn>
        {unscheduledCards.map(({ key, source, ...cardProps }, inventoryIndex) => (
          <ClassCard
            key={key}
            {...cardProps}
            gridColumn={dayCount + 3}
            inventoryIndex={inventoryIndex}
            squareEdges={isSquareEdges}
            isDragSource={source ? isDragSource(source.courseId, source.activity) : false}
            onExpand={
              source?.classId && !drag
                ? () => {
                    if (source.classId !== null) setExpandedClass({ classId: source.classId, timeIndex: null });
                  }
                : undefined
            }
            onPointerDown={
              source && !isSaving
                ? (event) => {
                    startDrag(event, { ...source, details: cardProps.details });
                  }
                : undefined
            }
          />
        ))}
      </UnscheduledColumn>
      {drag && (
        <>
          {dropSlots
            .filter((slot) => slot.dayIndex < dayCount)
            .map((slot) => (
              <ClassDropzone
                key={slot.id}
                gridColumn={slot.dayIndex + 2}
                offsetMinutes={slot.startMinutes - earliestStartHour * 60}
                durationMinutes={slot.endMinutes - slot.startMinutes}
                backgroundColour={drag.source.backgroundColour}
                squareEdges={isSquareEdges}
                highlighted={drag.target?.type === 'class' && drag.target.classId === slot.classData.class_id}
                location={slot.classData.times[slot.timeIndex].location}
                label={`${slot.classData.course.course_code} ${slot.classData.activity} ${slot.classData.section}`}
                elementRef={(element) => {
                  registerDropzone(slot.id, element, { type: 'class', classId: slot.classData.class_id });
                }}
              />
            ))}
          <ClassDropzone
            gridColumn={dayCount + 3}
            backgroundColour={drag.source.backgroundColour}
            squareEdges={isSquareEdges}
            highlighted={drag.target?.type === 'unscheduled'}
            isUnscheduled
            label="Unscheduled drop target"
            elementRef={(element) => {
              registerDropzone('unscheduled', element, { type: 'unscheduled' });
            }}
          />
          {createPortal(
            <ClassCard
              title={drag.source.title}
              details={drag.source.details}
              metadata={drag.source.metadata}
              backgroundColour={drag.source.backgroundColour}
              squareEdges={isSquareEdges}
              style={{
                position: 'fixed',
                left: drag.left,
                top: drag.top,
                width: drag.width,
                height: drag.height,
                pointerEvents: 'none',
                zIndex: 1500,
                transform: 'scale(1.1)',
                boxShadow: '0 8px 24px rgb(0 0 0 / 30%)',
              }}
            />,
            document.body,
          )}
        </>
      )}
      {expandedClass && expandedClassData && (
        <ExpandedClassView
          key={[expandedClass.classId, expandedClass.timeIndex].join('-')}
          classData={expandedClassData}
          classes={classes}
          timeIndex={expandedClass.timeIndex}
          isSaving={isSaving}
          handleClose={(classId) => {
            if (classId !== expandedClassData.class_id) {
              if (!canDrag()) return;
              setSaveFailed(false);
              updateClass.mutate(
                {
                  timetableId,
                  courseId: expandedClassData.course_id,
                  classId,
                  previousClassId: expandedClassData.class_id,
                },
                {
                  onError: () => {
                    setSaveFailed(true);
                  },
                },
              );
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
