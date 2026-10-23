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
  removeTimetableCourse,
  renameTimetable,
  reorderTimetables,
  updateEvent,
} from './routes';
import { type ActivityChange, enqueueSelectedClassChange } from './selectedClassQueue';

import { CreatedEvent, PeriodInfo, TimetablePayload } from '../../interfaces/Timetable'
import NetworkError from '../../interfaces/Error';
import { API_URL } from '../config';

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

export const useUpdateSelectedClass = (onError?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['selectedClass'],
    mutationFn: (change: ActivityChange) => enqueueSelectedClassChange(queryClient, change),
    retry: false,
    onError,
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



// Autotimetabling



export function buildTimetableData( autoParams: Array<string | number>, 
  classMode: string,
  periodInfoPerMode: Record<string, PeriodInfo[]>,
  createdEvents: Record<string, CreatedEvent>
): TimetablePayload {
  const keys = ['start', 'end', 'days', 'gap', 'maxdays'];

  const baseData = keys.reduce<Record<string, unknown>>((acc, key, index) => {
    acc[key] = autoParams[index];
    return acc;
  }, {});

  const formattedEvents: PeriodInfo[] = Object.values(createdEvents).map((event) => ({
    periodsPerClass: 1,
    periodTimes: [event.time.day, event.time.start],
    durations: [event.time.end - event.time.start],
  }));

  return {
    ...baseData,
    periodInfoList: [
      ...(periodInfoPerMode[classMode] || []),
      ...formattedEvents,
    ],
  };
}


export async function getAutoTimetable(
  timetableData: TimetablePayload
): Promise<[any[], boolean]> {
  try {
    //FIX!! I'm not sure if it is API_URL.server or not - it seems like the .auto got removed, so im assuming that
    // since it's just a string, i just replaced it with the .server one (there are no instances of auto anywhere else)
    const res = await fetch(`${API_URL.server}/autotimetabler`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timetableData),
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new NetworkError(`Autotimetable request failed (${res.status}): ${body.slice(0, 200)}`);
      // throw new NetworkError("Couldn't get response");
    }

    const content = await res.json();

    const events = content.given ?? content.events ?? [];
    const isOptimal = Boolean(content.optimal ?? content.isOptimal ?? false);

    return [events, isOptimal];
  } catch (error) {
    console.error('Autotimetable request failed:', error);
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(error instanceof Error ? `Couldn't get response: ${error.message}` : `Couldn't get response`);
  }
};