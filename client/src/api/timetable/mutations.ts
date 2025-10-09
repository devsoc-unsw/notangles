import { QueryClient, useMutation } from '@tanstack/react-query';

import { addTimetableCourse, createTimetable, removeTimetableCourse } from './routes';

export const useRemoveTimetableCourse = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: removeTimetableCourse,
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
    },
  });

export const useAddTimetableCourse = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: addTimetableCourse,
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.timetableId, 'courses'] });
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetableIds'] });
      variables.onSuccess(data);
    },
  });
