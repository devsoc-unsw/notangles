import { apiClient } from '../config';

export const getTimetableIds = async (year: string, term: string): Promise<string[]> => {
  return (await apiClient.get('/user/timetables', { params: { year, term } })).data;
};

export const getTimetableCourses = async (timetableId: string): Promise<{ courseId: string; colour: string }[]> => {
  return (await apiClient.get(`/user/timetables/courses/${timetableId}`)).data;
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

export const getTimetableInfo = async (
  timetableId: string,
): Promise<{ id: string; name: string; year: number; term: string; primary: boolean }> => {
  return (await apiClient.get(`/user/timetables/${timetableId}`)).data;
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
  return (await apiClient.post('/user/timetables', { name, year, term })).data;
};
