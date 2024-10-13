import { gql } from '@apollo/client';

import { client } from '../api/config';
import { DbCourse, DbTimes } from '../interfaces/Database';
import { QueryResponse } from '../interfaces/GraphQLCourseInfo';
import NetworkError from '../interfaces/NetworkError';
import { CourseCode, CourseData } from '../interfaces/Periods';
import { dbCourseToCourseData } from '../utils/DbCourse';
import { graphQLCourseToDbCourse } from '../utils/graphQLCourseToRestCourse';

const GET_COURSE_INFO = gql`
  query GetCourseInfo($courseCode: String!, $term: String!) {
    courses(where: { course_code: { _eq: $courseCode } }) {
      course_code
      course_name
      classes(where: { term: { _eq: $term }, activity: { _neq: "Course Enrolment" } }) {
        activity
        status
        course_enrolment
        section
        times {
          day
          time
          weeks
          location
        }
      }
    }
  }
`;

/**
 * Converts a string representation of what weeks a class runs to an array
 * e.g. "1-5,7-10" -> [1, 2, 3, 4, 5, 7, 8, 9, 10]
 *
 * @param dbClassWeeks The weeks a class is running
 * @param dbClassTimesList The output array
 */
const convertTimesToList = (dbClassWeeks: string, dbClassTimesList: number[]) => {
  for (let k = 0; k < dbClassWeeks.length; k++) {
    const times = dbClassWeeks.split(',');
    times.map((time) => {
      if (time.includes('-')) {
        // Convert ranges into numbers
        const [min, max] = time.split('-');
        for (let j = parseInt(min); j < parseInt(max); j++) {
          dbClassTimesList.push(j);
        }
      } else {
        // If not a range, add number to array directly
        dbClassTimesList.push(parseInt(time));
      }
    });
  }
};

/**
 * @param dbClassTimesOne The first class
 * @param dbClassTimesTwo The second class
 * @returns If the two classes are equivalent
 */
const classesAreEqual = (dbClassTimesOne: DbTimes, dbClassTimesTwo: DbTimes): boolean => {
  return (
    dbClassTimesOne.day == dbClassTimesTwo.day &&
    dbClassTimesOne.location == dbClassTimesTwo.location &&
    dbClassTimesOne.time.start == dbClassTimesTwo.time.start &&
    dbClassTimesOne.time.end == dbClassTimesTwo.time.end
  );
};

/**
 * Sorts and removes duplicates from an array
 *
 * @param arr The array
 * @returns The sorted array without duplicates
 */
const sortUnique = (arr: number[]): number[] => {
  if (arr.length === 0) return arr;
  arr = arr.sort((a, b) => a - b);

  const ret = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] !== arr[i]) {
      ret.push(arr[i]);
    }
  }

  return ret;
};

/**
 * Fetches the information of a specified course
 *
 * @param courseCode The code of the course to fetch
 * @param isConvertToLocalTimezone Whether the user wants to convert the course periods into their local timezone
 * @return A promise containing the information of the course that is offered in the
 * current year and term
 *
 * @example
 * const selectedCourseClasses = await getCourseInfo('COMP1511', true)
 */
const getCourseInfo = async (courseCode: CourseCode, isConvertToLocalTimezone: boolean): Promise<CourseData> => {
  try {
    const term = 'T3'; // TODO: get current term
    const data: QueryResponse = await client.query({
      query: GET_COURSE_INFO,
      variables: { courseCode, term },
    });
    const json: DbCourse = graphQLCourseToDbCourse(data);

    json.classes.forEach((dbClass) => {
      // Some courses split up a single class into two separate classes. e.g. CHEM1011 does it (as of 22T3)
      // because one half of the course is taught by one lecturer and the other half is taught by another.
      // This causes two cards to be generated for the same class which is not ideal, thus the following code
      // consolidates the separate classes into one class.

      for (let i = 0; i < dbClass.times.length - 1; i += 1) {
        for (let j = i + 1; j < dbClass.times.length; j += 1) {
          const dbClassTimesOne = dbClass.times[i];
          const dbClassTimesTwo = dbClass.times[j];

          if (classesAreEqual(dbClassTimesOne, dbClassTimesTwo)) {
            let dbClassTimesList: number[] = [];

            convertTimesToList(dbClassTimesOne.weeks, dbClassTimesList);
            convertTimesToList(dbClassTimesTwo.weeks, dbClassTimesList);

            dbClassTimesList = sortUnique(dbClassTimesList);

            let newWeeks: string = '';
            let isEndOfRange = false;

            // Convert the numerical representation of the weeks the classes are running back to a string
            for (let k = 0; k < dbClassTimesList.length; k++) {
              if (k == 0 || k == dbClassTimesList.length - 1) {
                newWeeks += dbClassTimesList[k];
              } else if (isEndOfRange) {
                // Add the start of the range
                newWeeks += dbClassTimesList[k];
                isEndOfRange = false;
              }

              while (dbClassTimesList[k + 1] == dbClassTimesList[k] + 1) {
                // Keep iterating until you reach the end of the range (numbers stop being consecutive)
                k++;
              }

              if (!isEndOfRange) {
                // Add the end of the range (last consecutive number)
                newWeeks += '-' + dbClassTimesList[k];

                // If this isn't the last week, we will need to add more weeks
                if (k !== dbClassTimesList.length - 1) {
                  newWeeks += ',';
                }

                // Get ready to add the end of the range
                isEndOfRange = true;
              }
            }

            dbClassTimesOne.weeks = newWeeks;
            dbClass.times.splice(dbClass.times.indexOf(dbClassTimesTwo), 1);
          }
        }
      }
    });

    if (!json) throw new NetworkError('Internal server error');
    return dbCourseToCourseData(json, isConvertToLocalTimezone);
  } catch (error) {
    console.log(error);
    throw new NetworkError('Could not connect to server');
  }
};

export default getCourseInfo;
