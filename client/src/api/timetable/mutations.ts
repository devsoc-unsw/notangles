import { QueryClient, useMutation } from '@tanstack/react-query';

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

export const useRemoveTimetableCourse = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: removeTimetableCourse,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
    },
  });

export const useAddTimetableCourse = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: addTimetableCourse,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
    },
  });

export const useCreateTimetable = (queryClient: QueryClient) =>
  useMutation({
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

export const useDeleteTimetable = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: ({ timetableId, onSuccess: _ }: { timetableId: string; onSuccess: () => void }) =>
      deleteTimetable({ timetableId }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId] });
      variables.onSuccess();
    },
  });

export const useRenameTimetable = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: renameTimetable,
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'info'] });
    },
  });

export const useMakePrimaryTimetable = (queryClient: QueryClient) =>
  useMutation({
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

export const useDuplicateTimetable = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: ({ timetableId, onSuccess: _ }: { timetableId: string; onSuccess: (id: string) => void }) =>
      duplicateTimetable(timetableId),
    onSuccess: async (data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      variables.onSuccess(data);
    },
  });

export const useAddTimetableEvent = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: ({ event }: { event: AddEventParams }) => addEvent(event),
    onSuccess: async (_data, variables, _context) => {
      await queryClient.invalidateQueries({ queryKey: ['timetable', variables.event.timetableId] });
    },
  });
