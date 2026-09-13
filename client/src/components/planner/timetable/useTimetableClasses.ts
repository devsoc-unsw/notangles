import { useMemo } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import type { TimetableCourse } from '../../../api/timetable/routes';

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
