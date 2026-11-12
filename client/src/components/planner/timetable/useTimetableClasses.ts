import { useMemo } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { tryParseClassTimeRange } from '../../../utils/time';

export interface ClassCardMetadata {
  enrolment: string;
  weeks: string;
  locations: string[];
  warning: boolean;
}

/**
 * Build class options matching the reference course, activity, day and time range.
 *
 * @param classData The reference class used to find matching options
 * @param timeIndex The index of the reference meeting
 * @param classes   Available classes for searching
 * @returns         Matched options containing class data, meeting index and location
 */
export const getClassLocationOptions = (classData: TimetableClass, timeIndex: number, classes: TimetableClass[]) => {
  const time = classData.times.at(timeIndex);
  if (!time) return [];
  const result = tryParseClassTimeRange(time.time, classData.class_id);
  if (!result.ok) return [];
  const range = result.value;
  return classes
    .filter((candidate) => candidate.course_id === classData.course_id && candidate.activity === classData.activity)
    .sort(
      (a, b) =>
        a.section.localeCompare(b.section, undefined, { numeric: true }) ||
        a.class_id.localeCompare(b.class_id, undefined, { numeric: true }),
    )
    .flatMap((candidate) => {
      const matchingIndex =
        candidate.class_id === classData.class_id
          ? timeIndex
          : candidate.times.findIndex((candidateTime) => {
              const candidateResult = tryParseClassTimeRange(candidateTime.time, candidate.class_id);
              if (!candidateResult.ok) return false;
              const candidateRange = candidateResult.value;
              return (
                candidateTime.day === time.day &&
                candidateRange.startMinutes === range.startMinutes &&
                candidateRange.endMinutes === range.endMinutes
              );
            });
      const matchingTime = matchingIndex < 0 ? undefined : candidate.times.at(matchingIndex);
      return matchingTime
        ? [
            {
              classData: candidate,
              timeIndex: matchingIndex,
              location: matchingTime.location.split(' (')[0].trim(),
            },
          ]
        : [];
    });
};

export const getClassCardMetadata = (
  classData: TimetableClass,
  timeIndex: number,
  classes: TimetableClass[],
): ClassCardMetadata | undefined => {
  const time = classData.times.at(timeIndex);
  if (!time) return undefined;
  const locations = [
    ...new Set(
      [
        time.location.split(' (')[0].trim(),
        ...getClassLocationOptions(classData, timeIndex, classes).map((option) => option.location),
      ].filter(Boolean),
    ),
  ];
  const enrolment = /^(\d+)\s*\/\s*(\d+)$/.exec(classData.course_enrolment.trim());
  const status = classData.status?.trim().toLowerCase();
  const weeks = time.weeks.trim().replace(/,\s*/g, ', ');

  return {
    enrolment:
      status === 'on hold' ? 'On Hold' : enrolment ? `${enrolment[1]} / ${enrolment[2]}` : 'Enrolment unavailable',
    weeks: weeks ? `${/^\d+$/.test(weeks) ? 'Week' : 'Weeks'} ${weeks}` : '',
    locations,
    warning: Boolean(status && status !== 'open'),
  };
};

export interface ScheduledClass {
  course: TimetableCourse;
  classData: TimetableClass;
}

export interface UnscheduledActivity {
  course: TimetableCourse;
  activity: string;
  availableClasses: TimetableClass[];
}

export interface TimetableClassesView {
  scheduledClasses: ScheduledClass[];
  unscheduledActivities: UnscheduledActivity[];
  unresolvedSelectedClassIds: string[];
}

const activityKey = (courseId: string, activity: string) => `${courseId}-${activity}`;

export const buildTimetableClasses = (courses: TimetableCourse[], classes: TimetableClass[]): TimetableClassesView => {
  const coursesById = new Map(courses.map((course) => [course.courseId, course]));
  const classesById = new Map(classes.map((classData) => [classData.class_id, classData]));
  const scheduledClasses: ScheduledClass[] = [];
  const scheduledActivities = new Set<string>();
  const unresolvedSelectedClassIds: string[] = [];

  for (const course of courses) {
    for (const classId of course.selectedClasses) {
      const classData = classesById.get(classId);

      if (!classData || classData.course_id !== course.courseId) {
        unresolvedSelectedClassIds.push(classId);
        continue;
      }

      scheduledClasses.push({ course, classData });
      scheduledActivities.add(activityKey(course.courseId, classData.activity));
    }
  }

  const unscheduledByActivity = new Map<string, UnscheduledActivity>();

  for (const classData of classes) {
    const course = coursesById.get(classData.course_id);
    if (!course) continue;

    const key = activityKey(course.courseId, classData.activity);
    if (scheduledActivities.has(key)) continue;

    const existingActivity = unscheduledByActivity.get(key);
    if (existingActivity) {
      existingActivity.availableClasses.push(classData);
    } else {
      unscheduledByActivity.set(key, {
        course,
        activity: classData.activity,
        availableClasses: [classData],
      });
    }
  }

  return {
    scheduledClasses,
    unscheduledActivities: [...unscheduledByActivity.values()],
    unresolvedSelectedClassIds,
  };
};

export const useTimetableClasses = (courses: TimetableCourse[], classes: TimetableClass[]) =>
  useMemo(() => buildTimetableClasses(courses, classes), [courses, classes]);
