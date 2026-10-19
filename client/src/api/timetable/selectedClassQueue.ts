import type { QueryClient } from '@tanstack/react-query';

import { getTimetableCourses, removeSelectedClass, type TimetableCourse, updateSelectedClass } from './routes';

export interface SelectedClassActivity {
  timetableId: string;
  courseId: string;
  activity: string;
  activityClassIds: string[];
}

// ActivityChange represents a change of class
export interface ActivityChange extends SelectedClassActivity {
  selectedClassId: string | null;
}

// SelectionState represents a course's actual state of classes
interface SelectionState {
  courseId: string;
  classIds: Set<string>;
  confirmedClassId: string | null;
}

// PendingChange represents a pending change of class, which is in the queue and
// waiting to be processed
interface PendingChange {
  change: ActivityChange;
  selection: SelectionState;
  ready: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

// The queue storing all pending activity changes
interface SelectionQueue {
  // The key is a string consists of courseId and activity
  selections: Map<string, SelectionState>;
  pending: PendingChange[];
  needsReconcile: boolean;
}

// Queues are shared by hook instances and retained across timetable component remounts
const queues = new WeakMap<QueryClient, Map<string, SelectionQueue>>();
const coursesKey = (timetableId: string) => ['timetable', timetableId, 'courses'];

export const applySelectedClasses = (
  queryClient: QueryClient,
  timetableId: string,
  courses: TimetableCourse[],
): TimetableCourse[] => {
  const queue = queues.get(queryClient)?.get(timetableId);
  if (!queue) return courses;

  const chosen = new Map<SelectionState, string | null>();
  for (const selection of queue.selections.values()) {
    chosen.set(selection, selection.confirmedClassId);
  }
  // The priority of pending classes are higher than the confirmed onces,
  // because the latest user changes should be applied to the frontend
  // before they are actually processed
  for (const operation of queue.pending) {
    chosen.set(operation.selection, operation.change.selectedClassId);
  }

  return courses.map((course) => {
    let selectedClasses = course.selectedClasses;
    for (const [selection, classId] of chosen) {
      if (selection.courseId !== course.courseId) continue;
      selectedClasses = selectedClasses.filter((id) => !selection.classIds.has(id));
      if (classId !== null) {
        selectedClasses = [...selectedClasses, classId];
      }
    }
    return selectedClasses === course.selectedClasses ? course : { ...course, selectedClasses };
  });
};

const updateCachedSelections = (queryClient: QueryClient, timetableId: string) => {
  queryClient.setQueryData<TimetableCourse[]>(coursesKey(timetableId), (courses) =>
    courses ? applySelectedClasses(queryClient, timetableId, courses) : courses,
  );
};

// Synchronize the confirmedClassId of all courses according to the backend data
const refreshConfirmedSelections = async (timetableId: string, queue: SelectionQueue) => {
  const courses = await getTimetableCourses(timetableId);
  for (const selection of queue.selections.values()) {
    selection.confirmedClassId =
      courses
        .find((course) => course.courseId === selection.courseId)
        ?.selectedClasses.find((id) => selection.classIds.has(id)) ?? null;
  }
  queue.needsReconcile = false;
};

const processSelectionQueue = async (queryClient: QueryClient, timetableId: string, queue: SelectionQueue) => {
  let operation: PendingChange | undefined;
  while ((operation = queue.pending.at(0))) {
    const { change, selection } = operation;
    try {
      await operation.ready;
      if (queue.needsReconcile) {
        await refreshConfirmedSelections(timetableId, queue);
      }

      if (change.selectedClassId !== selection.confirmedClassId) {
        if (change.selectedClassId !== null) {
          // Apply the new class selection to the backend
          await updateSelectedClass({ timetableId, courseId: change.courseId, classId: change.selectedClassId });
        } else if (selection.confirmedClassId !== null) {
          // Remove the confirmed class from the backend when deselected
          await removeSelectedClass({ timetableId, courseId: change.courseId, classId: selection.confirmedClassId });
        }
      }

      selection.confirmedClassId = change.selectedClassId;
      operation.resolve();
    } catch (err) {
      queue.needsReconcile = true;
      try {
        await refreshConfirmedSelections(timetableId, queue);
        if (selection.confirmedClassId === change.selectedClassId) operation.resolve();
        else operation.reject(err);
      } catch {
        operation.reject(err);
      }
    }

    queue.pending.shift();
    // Reapply later user intent over confirmed selections
    updateCachedSelections(queryClient, timetableId);
  }
  queues.get(queryClient)?.delete(timetableId);
  await queryClient.invalidateQueries({ queryKey: coursesKey(timetableId), exact: true });
};

export const enqueueSelectedClassChange = (queryClient: QueryClient, change: ActivityChange): Promise<void> => {
  // Find or create a timetable queue
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

  for (const id of change.activityClassIds) {
    selection.classIds.add(id);
  }

  const ready = queryClient.cancelQueries({ queryKey: coursesKey(change.timetableId), exact: true });
  const shouldStart = queue.pending.length === 0;
  const result = new Promise<void>((resolve, reject) => {
    queue.pending.push({ change, selection, ready, resolve, reject });
  });

  updateCachedSelections(queryClient, change.timetableId);

  // If the queue was empty, start processing change requests
  if (shouldStart) {
    void processSelectionQueue(queryClient, change.timetableId, queue);
  }
  return result;
};
