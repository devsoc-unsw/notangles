import { QueryClient, useMutation } from '@tanstack/react-query';

import {
  addTimetableCourse,
  createTimetable,
  deleteTimetable,
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
    mutationFn: deleteTimetable,
    onSuccess: (_data, timetableId, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', timetableId] });
      queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
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
    mutationFn: makePrimaryTimetable,
    onSuccess: (_data, timetableId, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', timetableId, 'info'] });
    },
  });
