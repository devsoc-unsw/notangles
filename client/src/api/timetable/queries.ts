import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { Term } from '../times/times';
import {
  getEventInfo,
  getTimetableCourses,
  getTimetableEvents,
  getTimetableIds,
  getTimetableInfo,
} from '../timetable/routes';
import { projectSelectedClasses } from './selectedClassQueue';

export const useTimetableIdsQuery = (term: Term) =>
  useSuspenseQuery({
    queryKey: ['timetableIds', String(term.year), term.term],
    queryFn: () => getTimetableIds(String(term.year), term.term),
  }).data;

export const useTimetableCoursesQuery = (timetableId: string) =>
  useSuspenseQuery({
    queryKey: ['timetable', timetableId, 'courses'],
    queryFn: async ({ client }) => projectSelectedClasses(client, timetableId, await getTimetableCourses(timetableId)),
  }).data;

export const useTimetableInfoQuery = (timetableId: string) =>
  useSuspenseQuery({
    queryKey: ['timetable', timetableId, 'info'],
    queryFn: () => getTimetableInfo(timetableId),
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

export const useTimetableEventsQuery = (timetableId: string) =>
  useSuspenseQuery({
    queryKey: ['timetable', timetableId, 'events'],
    queryFn: () => getTimetableEvents(timetableId),
  }).data;

export const useEventInfoQuery = (eventId: string) =>
  useSuspenseQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventInfo(eventId),
  }).data;

export const useEventInfoQueries = (eventIds: string[]) => {
  const queries = useSuspenseQueries({
    queries: eventIds.map((id) => ({
      queryKey: ['event', id],
      queryFn: () => getEventInfo(id),
    })),
  });

  return queries.map((query) => query.data);
};
