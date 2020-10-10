import { CourseData } from '@notangles/common';
import { DbCourse, dbCourseToCourseData } from '../interfaces/DbCourse';
import { API_URL } from './config';
import NetworkError from '../interfaces/NetworkError';
import timeoutPromise from '../utils/timeoutPromise';
import TimeoutError from '../interfaces/TimeoutError';

/**
 * Fetches the information of a specified course
 *
 * @param year The year that the course is offered in
 * @param term The term that the course is offered in
 * @param courseCode The code of the course to fetch
 * @return A promise containing the information of the course that is offered in the
 * specified year and term
 *
 * @example
 * const selectedCourseClasses = await getCourseInfo('2019', 'T1', 'COMP1511')
 */
const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string,
): Promise<CourseData> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`;
  try {
    const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/${courseCode}/`));
    if (data.status === 400) {
      throw new NetworkError('Internal server error');
    }
    const json: DbCourse = await data.json();
    if (!json) {
      throw new NetworkError('Internal server error');
    }
    return dbCourseToCourseData(json);
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw new NetworkError('Could not connect to server');
    } else {
      throw error;
    }
  }
};

export default getCourseInfo;
