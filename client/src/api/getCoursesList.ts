// https://notangles-server.csesoc.unsw.edu.au/api/terms/2021-T3/courses/

import { CoursesList } from '../interfaces/CourseOverview';
import { API_URL } from './config';
import NetworkError from '../interfaces/NetworkError';
import timeoutPromise from '../utils/timeoutPromise';
// import TimeoutError from '../interfaces/TimeoutError';

interface FetchedCourse {
  _id: string;
  courseCode: string;
  name: string;
}

const toCoursesList = (data: FetchedCourse[]): CoursesList => (
  data.map((course) => ({
    id: course._id,
    code: course.courseCode,
    name: course.name,
  }))
);

interface CoursesListWithDate {
  lastUpdated: number;
  courses: CoursesList;
}

/**
 * Fetches a list of course objects, where each course object contains
 * the course id, the course code, and course name
 *
 * Expected response format: {lastUpdated: number, courses: [...]};
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
): Promise<CoursesListWithDate> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`;
  try {
    const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/`));
    const json = await data.json();

    if (data.status === 400) {
      throw new NetworkError('Internal server error');
    }

    return {
      lastUpdated: json.lastUpdated,
      courses: toCoursesList(json.courses),
    };
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getCoursesList;
