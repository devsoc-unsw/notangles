import { apiClient } from '../config';

export const getTimetableIds = async (year: string, term: string): Promise<string[]> => {
  return (await apiClient.get<string[]>('/user/timetables', { params: { year, term } })).data;
};

interface TimetableCourse {
  courseId: string;
  colour: string;
}
export const getTimetableCourses = async (timetableId: string): Promise<TimetableCourse[]> => {
  return (await apiClient.get<TimetableCourse[]>(`/user/timetables/courses/${timetableId}`)).data;
};

export const removeTimetableCourse = async ({
  timetableId,
  courseId,
}: {
  timetableId: string;
  courseId: string;
}): Promise<void> => {
  await apiClient.delete(`/user/timetables/course/${timetableId}/${courseId}`);
};

export const addTimetableCourse = async ({
  timetableId,
  courseId,
  colour,
}: {
  timetableId: string;
  courseId: string;
  colour: string;
}): Promise<void> => {
  await apiClient.post(`/user/timetables/course/${timetableId}/${courseId}`, { colour });
};

interface TimetableInfo {
  id: string;
  name: string;
  year: number;
  term: string;
  primary: boolean;
}
export const getTimetableInfo = async (timetableId: string): Promise<TimetableInfo> => {
  return (await apiClient.get<TimetableInfo>(`/user/timetables/${timetableId}`)).data;
};

export const createTimetable = async ({
  name,
  year,
  term,
}: {
  name: string;
  year: number;
  term: string;
}): Promise<string> => {
  return (await apiClient.post<string>('/user/timetables', { name, year, term })).data;
};

export const deleteTimetable = async ({ timetableId }: { timetableId: string }): Promise<void> => {
  await apiClient.delete(`/user/timetables/${timetableId}`);
};

export const renameTimetable = async ({
  timetableId,
  newName,
}: {
  timetableId: string;
  newName: string;
}): Promise<void> => {
  await apiClient.patch(`/user/timetables/${timetableId}/rename`, { name: newName });
};

export const makePrimaryTimetable = async (timetableId: string): Promise<void> => {
  await apiClient.patch(`/user/timetables/${timetableId}/change-primary`);
};

export const duplicateTimetable = async (timetableId: string): Promise<string> => {
  return (await apiClient.post<string>(`/user/timetables/${timetableId}/duplicate`)).data;
};

export const reorderTimetables = async (orderedIds: string[]): Promise<void> => {
  await apiClient.patch('/user/timetables/reorder', { ids: orderedIds });
};

interface TimetableEvent {
  id: string;
  timetableId: string;
  colour: string;
  title: string;
  location: string | null;
  description: string | null;
  dayOfWeek: number;
  start: number;
  end: number;
  type: 'CUSTOM' | 'TUTORING';
}

export const getEventInfo = async (eventId: string) => {
  return (await apiClient.get<TimetableEvent>(`/user/timetables/event/${eventId}`)).data;
};

export interface AddEventParams {
  timetableId: string;
  colour: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  start: number; // Mins since midnight
  end: number; // Mins since midnight
  type: 'CUSTOM' | 'TUTORING';
  title: string;
  description?: string;
  location?: string;
}
export const addEvent = async ({
  timetableId,
  colour,
  dayOfWeek,
  start,
  end,
  type,
  title,
  description,
  location,
}: AddEventParams): Promise<void> => {
  await apiClient.post(`/user/timetables/event/${timetableId}`, {
    event: {
      colour,
      dayOfWeek,
      start,
      end,
      type,
      title,
      description,
      location,
    },
  });
};
