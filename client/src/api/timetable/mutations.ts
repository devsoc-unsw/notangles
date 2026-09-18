import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addEvent,
  AddEventParams,
  addTimetableCourse,
  createTimetable,
  deleteEvent,
  deleteTimetable,
  duplicateTimetable,
  EditEventParams,
  makePrimaryTimetable,
  removeSelectedClass,
  removeTimetableCourse,
  renameTimetable,
  reorderTimetables,
  type TimetableCourse,
  updateEvent,
  updateSelectedClass,
} from './routes';

export const useRemoveTimetableCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTimetableCourse,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
    },
  });
};

export const useAddTimetableCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTimetableCourse,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
    },
  });
};

export interface UpdateSelectedClassParams {
  timetableId: string;
  courseId: string;
  classId: string;
  // null means this activity is currently unscheduled.
  previousClassId: string | null;
}

export const selectedClassMutationKey = ['selectedClass'] as const;

export const useUpdateSelectedClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: selectedClassMutationKey,
    mutationFn: ({ timetableId, courseId, classId }: UpdateSelectedClassParams) =>
      updateSelectedClass({ timetableId, courseId, classId }),
    onMutate: async ({ timetableId, courseId, classId, previousClassId }) => {
      const queryKey = ['timetable', timetableId, 'courses'];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TimetableCourse[]>(queryKey);

      queryClient.setQueryData<TimetableCourse[]>(queryKey, (courses) =>
        courses?.map((course) =>
          course.courseId === courseId
            ? {
                ...course,
                selectedClasses: [
                  ...course.selectedClasses.filter((id) => id !== previousClassId && id !== classId),
                  classId,
                ],
              }
            : course,
        ),
      );
      return { previous };
    },
    onError: (_error, { timetableId }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['timetable', timetableId, 'courses'], context.previous);
      }
    },
    onSettled: async (_data, _error, { timetableId }) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', timetableId, 'courses'] });
    },
  });
};

export const useRemoveSelectedClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: selectedClassMutationKey,
    mutationFn: removeSelectedClass,
    onMutate: async ({ timetableId, courseId, classId }) => {
      const queryKey = ['timetable', timetableId, 'courses'];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TimetableCourse[]>(queryKey);

      queryClient.setQueryData<TimetableCourse[]>(queryKey, (courses) =>
        courses?.map((course) =>
          course.courseId === courseId
            ? { ...course, selectedClasses: course.selectedClasses.filter((id) => id !== classId) }
            : course,
        ),
      );
      return { previous };
    },
    onError: (_error, { timetableId }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['timetable', timetableId, 'courses'], context.previous);
      }
    },
    onSettled: async (_data, _error, { timetableId }) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', timetableId, 'courses'] });
    },
  });
};

export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      year,
      term,
      onSuccess: _,
    }: {
      name: string;
      year: number;
      term: string;
      onSuccess: (id: string) => void;
    }) => createTimetable({ name, year, term }),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      variables.onSuccess(data);
    },
  });
};

export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timetableId, onSuccess: _ }: { timetableId: string; onSuccess: () => void }) =>
      deleteTimetable({ timetableId }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId] });
      variables.onSuccess();
    },
  });
};

export const useRenameTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renameTimetable,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'info'] });
    },
  });
};

export const useMakePrimaryTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      timetableId,
      currentPrimaryTimetableId: _,
    }: {
      timetableId: string;
      currentPrimaryTimetableId: string;
    }) => makePrimaryTimetable(timetableId),
    onSuccess: async (_data, { timetableId, currentPrimaryTimetableId }, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', timetableId, 'info'] });
      await queryClient.invalidateQueries({ queryKey: ['timetable', currentPrimaryTimetableId, 'info'] });
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
    },
  });
};

export const useDuplicateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timetableId, onSuccess: _ }: { timetableId: string; onSuccess: (id: string) => void }) =>
      duplicateTimetable(timetableId),
    onSuccess: async (data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      variables.onSuccess(data);
    },
  });
};

export const useReorderTimetables = (year: string, term: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderTimetables(orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ['timetableIds', year, term] });
      const previous = queryClient.getQueryData<string[]>(['timetableIds', year, term]);
      queryClient.setQueryData(['timetableIds', year, term], orderedIds);
      return { previous };
    },
    onError: (_err, _orderedIds, context) => {
      queryClient.setQueryData(['timetableIds', year, term], context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds', year, term] });
    },
  });
};

// TODO: Consider query keys for events on timetables
export const useAddTimetableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ event }: { event: AddEventParams }) => addEvent(event),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.event.timetableId] });
    },
  });
};

export const useDeleteTimetableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId }: { timetableId: string; eventId: string }) => deleteEvent({ eventId }),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId] });
    },
  });
};

export const useUpdateTimetableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: EditEventParams) => updateEvent(event),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};

export const useSaveTimetableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      timetableId,
      event,
      eventType,
      additionalDays,
    }: {
      timetableId: string;
      event: EditEventParams;
      eventType: AddEventParams['type'];
      additionalDays: number[];
    }) => {
      await updateEvent(event);
      for (const dayOfWeek of additionalDays) {
        await addEvent({
          timetableId,
          colour: event.colour,
          dayOfWeek,
          start: event.start,
          end: event.end,
          type: eventType,
          title: event.title,
          description: event.description,
          location: event.location,
        });
      }
    },
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['event', variables.event.eventId] });
      if (variables.additionalDays.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'events'] });
      }
    },
  });
};
