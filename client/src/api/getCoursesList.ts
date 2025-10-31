import { gql } from '@apollo/client';

import { client } from '../api/config';
import { CoursesList, CoursesListWithDate, FetchedCourse } from '../interfaces/Courses';
import NetworkError from '../interfaces/NetworkError';

const toCoursesList = (data: FetchedCourse[]): CoursesList =>
  data.map((course) => ({
    code: course.course_code,
    name: course.course_name,
    online: course.online,
    inPerson: course.inPerson,
    career: course.career,
    faculty: course.faculty,
  }));

const GET_COURSE_LIST = gql`
  query GetCoursesByTerm {
    courses {
      campus
      career
      faculty
      modes
      school
      course_code
      course_name
      year
      terms
      uoc
    }
  }
`;

/**
 * Fetches a list of course objects, where each course object contains
 * the course id, the course code, and course name
 *
 * Expected response format: {courses: [...]};
 *
 * @param term The term that the courses are offered in
 * @return A promise containing the list of course objects offered in the specified term
 *
 * @example
 * const coursesList = await getCoursesList('T1')
 */
const getCoursesList = async (year: number, term: string): Promise<CoursesListWithDate> => {
  try {
    const termWithWildcard = `%${term}%`;
    const { data } = await client.query({ query: GET_COURSE_LIST });
    const courses = data.courses.filter((course: any) => course.terms.includes(term) && course.year === year);

    return {
      courses: toCoursesList(courses),
    };
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getCoursesList;
