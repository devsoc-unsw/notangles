import { QueryClient, useMutation } from '@tanstack/react-query';

import {
  addTimetableCourse,
  createTimetable,
  deleteTimetable,
  duplicateTimetable,
  makePrimaryTimetable,
  removeTimetableCourse,
  renameTimetable,
} from './routes';
import { data } from 'react-router';

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId] });
      variables.onSuccess();
    },
  });

export const useRenameTimetable = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: renameTimetable,
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'info'] });
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
    onSuccess: (_data, { timetableId, currentPrimaryTimetableId }, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', timetableId, 'info'] });
      queryClient.invalidateQueries({ queryKey: ['timetable', currentPrimaryTimetableId, 'info'] });
      queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
    },
  });

export const useDuplicateTimetable = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: duplicateTimetable,
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
    },
  });
