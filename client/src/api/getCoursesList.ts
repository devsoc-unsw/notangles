import { gql } from '@apollo/client';

import { client } from '../api/config';
import { CoursesList, CoursesListWithDate, FetchedCourse } from '../interfaces/Courses';
import NetworkError from '../interfaces/NetworkError';

// TODO: remove when gql integration is successful
// const toCoursesList = (data: FetchedCourse[]): CoursesList =>
//   data.map((course) => ({
//     code: course.courseCode,
//     name: course.name,
//     online: course.online,
//     inPerson: course.inPerson,
//     career: course.career,
//     faculty: course.faculty,
//   }));

// NOTE: Adjusted FetchedCourse interface
const toCoursesList = (data: FetchedCourse[]): CoursesList =>
  data.map((course) => ({
    code: course.course_code, // Adjusted to match GraphQL field names
    name: course.course_name,
    online: course.online,
    inPerson: course.inPerson,
    career: course.career,
    faculty: course.faculty,
  }));


// TODO: update when gql integration is successful
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
// TODO: remove when gql integration is successful
// const getCoursesList = async (year: string, term: string): Promise<CoursesListWithDate> => {
//   const baseURL = `${API_URL.timetable}/terms/${year}-${term}`;
//   try {
//     const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/`));
//     const json = await data.json();
//     if (data.status === 400) {
//       throw new NetworkError('Internal server error');
//     }

//     return {
//       lastUpdated: json.lastUpdated,
//       courses: toCoursesList(json.courses),
//     };
//   } catch (error) {
//     throw new NetworkError('Could not connect to server');
//   }
// };

// WITH GQL
const GET_COURSE_LIST = gql`
  query GetCoursesByTerm($term: String!) {
    courses(where: { classes: { term: { _eq: $term } } }) {
      campus
      career
      faculty
      modes
      school
      course_code
      course_name
      terms
      uoc
    }
  }
`;

const getCoursesList = async (term: string): Promise<CoursesListWithDate> => {
  try {
    const { data } = await client.query({ query: GET_COURSE_LIST, variables: { term } });

    return {
      // TODO: temp lastUpdated using Date.now() as mock, dont think its in gql schema
      lastUpdated: Date.now(),
      courses: toCoursesList(data.courses),
    };
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getCoursesList;
