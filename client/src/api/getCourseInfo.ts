import { CourseCode, CourseData } from '../interfaces/Course';
import { DbCourse, dbCourseToCourseData } from '../interfaces/DbCourse';
import { API_URL } from './config';
import NetworkError from '../interfaces/NetworkError';
import timeoutPromise from '../utils/timeoutPromise';
import { parseJSON } from 'date-fns';

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
const getCourseInfo = async (year: string, term: string, courseCode: CourseCode): Promise<CourseData> => {
  const baseURL = `${API_URL.timetable}/terms/${year}-${term}`;
  try {
    const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/${courseCode}/`));
    if (data.status === 400) {
      throw new NetworkError('Internal server error');
    }
    const json: DbCourse = await data.json();

    json.classes.forEach((dbClassOne) => {
      if ('times' in dbClassOne && dbClassOne.times.length > 1) {
        for (let i = 0; i < dbClassOne.times.length - 1; i += 1) {
          for (let j = i + 1; j < dbClassOne.times.length; j += 1) {
            if (dbClassOne.times[i].day == dbClassOne.times[j].day
              && dbClassOne.times[i].location == dbClassOne.times[j].location
              && dbClassOne.times[i].time.start == dbClassOne.times[j].time.start
              && dbClassOne.times[i].time.end == dbClassOne.times[j].time.end) {
              let weeksOne = dbClassOne.times[i].weeks.split(/,|-/)
              let weeksTwo = dbClassOne.times[j].weeks.split(/,|-/)
              if (parseInt(weeksOne[weeksOne.length - 1]) == parseInt(weeksTwo[0]) - 1) {
                let regex = new RegExp(weeksOne[weeksOne.length - 1] + "$", "g");
                dbClassOne.times[i].weeks = dbClassOne.times[i].weeks.replace(regex, '') + dbClassOne.times[j].weeks
              } else {
                dbClassOne.times[i].weeks = dbClassOne.times[i].weeks + dbClassOne.times[j].weeks
              }
              dbClassOne.times.splice(dbClassOne.times.indexOf(dbClassOne.times[j]), 1)
            }
          }
        }





      }
    });
    if (!json) {
      throw new NetworkError('Internal server error');
    }
    return dbCourseToCourseData(json);
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getCourseInfo;
