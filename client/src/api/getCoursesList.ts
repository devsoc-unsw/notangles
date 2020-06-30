import { CoursesList } from '../interfaces/CourseOverview';
import { API_URL, timeoutPromise } from './config';
import { NetworkError } from '../interfaces/NetworkError';

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
const getCoursesList = async (
  year: string,
  term: string,
): Promise<CoursesList | NetworkError> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`;
  try {
    const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/`));
    if (data.status === 400) {
      return { message: 'Internal server error' };
    }
    return data.json();
  } catch (error) {
    return { message: 'Could not connect to server' };
  }
};

export default getCoursesList;
