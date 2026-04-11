import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addEvent,
  AddEventParams,
  addTimetableCourse,
  createTimetable,
  deleteTimetable,
  duplicateTimetable,
  makePrimaryTimetable,
  removeTimetableCourse,
  renameTimetable,
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

export const useAddTimetableEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ event }: { event: AddEventParams }) => addEvent(event),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.event.timetableId] });
    },
  });
};
