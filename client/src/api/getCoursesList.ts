import { CoursesList } from '../interfaces/CourseOverview';
import { API_URL } from './config';

/**
 * Fetches a list of course objects, where each course object contains
 * the course id, the course code, and course name
 *
 * @param year The year that the courses are offered in
 * @param term The term that the courses are offered in
 * @return A promise containing the list of course objects offered in the specified year and term
 *
 * @example
 * const coursesList = await getCoursesList('2020', 'T1')
 */
export default async (
  year: string,
  term: string,
): Promise<CoursesList | null> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`;
  try {
    const data = await fetch(`${baseURL}/courses/`);
    return data.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
