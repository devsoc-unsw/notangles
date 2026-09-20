import type { QueryClient } from '@tanstack/react-query';

import { getTimetableCourses, removeSelectedClass, type TimetableCourse, updateSelectedClass } from './routes';

export interface SelectedClassGroup {
  timetableId: string;
  courseId: string;
  activity: string;
  activityClassIds: string[];
}

// SelectionChange represents a change of class
interface SelectionChange extends SelectedClassGroup {
  selectedClassId: string | null;
}

// Selection represents a course's exact state of classes
interface Selection {
  courseId: string;
  classIds: Set<string>;
  confirmedClassId: string | null;
}

// PendingChange represents a pending change of class, which is in the queue
interface PendingChange {
  change: SelectionChange;
  selection: Selection;
  ready: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

// The queue storing all pending classes
interface SelectionQueue {
  selections: Map<string, Selection>;
  pending: PendingChange[];
  needsReconcile: boolean;
}

// Queues are shared by hook instances and retained across timetable component remounts
const queues = new WeakMap<QueryClient, Map<string, SelectionQueue>>();
const coursesKey = (timetableId: string) => ['timetable', timetableId, 'courses'];

export const projectSelectedClasses = (
  queryClient: QueryClient,
  timetableId: string,
  courses: TimetableCourse[],
): TimetableCourse[] => {
  const queue = queues.get(queryClient)?.get(timetableId);
  if (!queue) return courses;

  const desired = new Map<Selection, string | null>();
  for (const selection of queue.selections.values()) desired.set(selection, selection.confirmedClassId);
  for (const operation of queue.pending) desired.set(operation.selection, operation.change.selectedClassId);

  return courses.map((course) => {
    let selectedClasses = course.selectedClasses;
    for (const [selection, classId] of desired) {
      if (selection.courseId !== course.courseId) continue;
      selectedClasses = selectedClasses.filter((id) => !selection.classIds.has(id));
      if (classId !== null) selectedClasses = [...selectedClasses, classId];
    }
    return selectedClasses === course.selectedClasses ? course : { ...course, selectedClasses };
  });
};

const publish = (queryClient: QueryClient, timetableId: string) => {
  queryClient.setQueryData<TimetableCourse[]>(coursesKey(timetableId), (courses) =>
    courses ? projectSelectedClasses(queryClient, timetableId, courses) : courses,
  );
};

const reconcile = async (timetableId: string, queue: SelectionQueue) => {
  const courses = await getTimetableCourses(timetableId);
  for (const selection of queue.selections.values()) {
    selection.confirmedClassId =
      courses
        .find((course) => course.courseId === selection.courseId)
        ?.selectedClasses.find((id) => selection.classIds.has(id)) ?? null;
  }
  queue.needsReconcile = false;
};

const drain = async (queryClient: QueryClient, timetableId: string, queue: SelectionQueue) => {
  let operation: PendingChange | undefined;
  while ((operation = queue.pending.at(0))) {
    const { change, selection } = operation;
    try {
      await operation.ready;
      if (queue.needsReconcile) await reconcile(timetableId, queue);

      if (change.selectedClassId !== selection.confirmedClassId) {
        if (change.selectedClassId !== null) {
          await updateSelectedClass({ timetableId, courseId: change.courseId, classId: change.selectedClassId });
        } else if (selection.confirmedClassId !== null) {
          await removeSelectedClass({ timetableId, courseId: change.courseId, classId: selection.confirmedClassId });
        }
      }
      selection.confirmedClassId = change.selectedClassId;
      operation.resolve();
    } catch (error) {
      queue.needsReconcile = true;
      try {
        await reconcile(timetableId, queue);
        if (selection.confirmedClassId === change.selectedClassId) operation.resolve();
        else operation.reject(error);
      } catch {
        operation.reject(error);
      }
    }
    queue.pending.shift();
    // Reapply later user intent over confirmed selections
    publish(queryClient, timetableId);
  }
  queues.get(queryClient)?.delete(timetableId);
  await queryClient.invalidateQueries({ queryKey: coursesKey(timetableId), exact: true });
};

export const enqueueSelectedClassChange = (queryClient: QueryClient, change: SelectionChange): Promise<void> => {
  let clientQueues = queues.get(queryClient);
  if (!clientQueues) {
    clientQueues = new Map();
    queues.set(queryClient, clientQueues);
  }
  let queue = clientQueues.get(change.timetableId);
  if (!queue) {
    queue = { selections: new Map(), pending: [], needsReconcile: false };
    clientQueues.set(change.timetableId, queue);
  }

  const groupKey = JSON.stringify([change.courseId, change.activity]);
  let selection = queue.selections.get(groupKey);
  if (!selection) {
    const course = queryClient
      .getQueryData<TimetableCourse[]>(coursesKey(change.timetableId))
      ?.find((item) => item.courseId === change.courseId);
    selection = {
      courseId: change.courseId,
      classIds: new Set(change.activityClassIds),
      confirmedClassId: course?.selectedClasses.find((id) => change.activityClassIds.includes(id)) ?? null,
    };
    queue.selections.set(groupKey, selection);
  }
  for (const id of change.activityClassIds) selection.classIds.add(id);

  const ready = queryClient.cancelQueries({ queryKey: coursesKey(change.timetableId), exact: true });
  const shouldStart = queue.pending.length === 0;
  const result = new Promise<void>((resolve, reject) => {
    queue.pending.push({ change, selection, ready, resolve, reject });
  });
  publish(queryClient, change.timetableId);
  if (shouldStart) void drain(queryClient, change.timetableId, queue);
  return result;
};
