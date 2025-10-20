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

export const deleteTimetable = async (timetableId: string): Promise<void> => {
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
