import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { Term } from '../times/times';
import { getTimetableCourses, getTimetableIds, getTimetableInfo } from '../timetable/routes';

export const useTimetableIdsQuery = (term: Term) =>
  useSuspenseQuery({
    queryKey: ['timetableIds', String(term.year), term.term],
    queryFn: () => getTimetableIds(String(term.year), term.term),
  }).data;

export const useTimetableCoursesQuery = (timetableId: string) =>
  useSuspenseQuery({
    queryKey: ['timetable', timetableId, 'courses'],
    queryFn: () => getTimetableCourses(timetableId),
  }).data;

export const useTimetableInfoQueries = (timetableIds: string[]) => {
  const queries = useSuspenseQueries({
    queries: timetableIds.map((id) => ({
      queryKey: ['timetable', id, 'info'],
      queryFn: () => getTimetableInfo(id),
    })),
  });

  return queries.map((query) => query.data);
};

export const useTimetableInfoQuery = (timetableId: string) =>
  useSuspenseQuery({
    queryKey: ['timetable', timetableId, 'info'],
    queryFn: () => getTimetableInfo(timetableId),
  }).data;
