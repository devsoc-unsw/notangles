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

const convertTimesToList = (dbClassWeeks: string, dbClassTimesList: number[]): number[] => {
  for (let k = 0; k < dbClassWeeks.length; k++) {
    // characters in the array are either '-',',' or a number from 0-9.
    if (dbClassWeeks[k] == '-') {
      // CASE 1: weeks are in a range, so we must add all the numbers within this range here
      // weeks are a one digit number
      let maximum: number = parseInt(dbClassWeeks[k + 1]);
      if (k + 1 < dbClassWeeks.length - 1 && dbClassWeeks[k + 2] != ',' && dbClassWeeks[k + 2] != '-') {
        // weeks are a two digit number
        maximum = parseInt(dbClassWeeks[k + 1] + dbClassWeeks[k + 2]);
      }
      while (dbClassTimesList[dbClassTimesList.length - 1] < maximum - 1) {
        // as this is a range, we need to add all the numbers between the range
        dbClassTimesList.push(dbClassTimesList[dbClassTimesList.length - 1] + 1);
      }
    } else if (dbClassWeeks[k] != ',' && dbClassWeeks[k] != '-') {
      // CASE 2: if this is not the middle of a range or a comma, we can just add the week as it is
      if (k < dbClassWeeks.length - 1 && dbClassWeeks[k + 1] != ',' && dbClassWeeks[k + 1] != '-') {
        // this week is a two digit number and the two digits must be added together
        dbClassTimesList.push(parseInt(dbClassWeeks[k] + dbClassWeeks[k + 1]));
        k++;
      } else {
        // this week is not a two digit number so we just add the one digit to it
        dbClassTimesList.push(parseInt(dbClassWeeks[k]));
      }
    }
  }
  return dbClassTimesList;
};

const sortUnique = (arr: number[]): number[] => {
  if (arr.length === 0) return arr;
  arr = arr.sort(function (a, b) {
    return a * 1 - b * 1;
  });
  let ret = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] !== arr[i]) {
      ret.push(arr[i]);
    }
  }
  return ret;
};

const getCourseInfo = async (year: string, term: string, courseCode: CourseCode): Promise<CourseData> => {
  const baseURL = `${API_URL.timetable}/terms/${year}-${term}`;
  try {
    const data = await timeoutPromise(1000, fetch(`${baseURL}/courses/${courseCode}/`));
    if (data.status === 400) {
      throw new NetworkError('Internal server error');
    }
    const json: DbCourse = await data.json();
    json.classes.forEach((dbClass) => {
      if ('times' in dbClass && dbClass.times.length > 1) {
        for (let i = 0; i < dbClass.times.length - 1; i += 1) {
          for (let j = i + 1; j < dbClass.times.length; j += 1) {
            let dbClassTimesOne = dbClass.times[i];
            let dbClassTimesTwo = dbClass.times[j];
            if (
              dbClassTimesOne.day == dbClassTimesTwo.day &&
              dbClassTimesOne.location == dbClassTimesTwo.location &&
              dbClassTimesOne.time.start == dbClassTimesTwo.time.start &&
              dbClassTimesOne.time.end == dbClassTimesTwo.time.end
            ) {
              let dbClassTimesList: number[] = [];

              dbClassTimesList = convertTimesToList(dbClassTimesOne.weeks, dbClassTimesList);
              dbClassTimesList = convertTimesToList(dbClassTimesTwo.weeks, dbClassTimesList);

              dbClassTimesList = sortUnique(dbClassTimesList);

              let newWeeks: string = '';
              let rangeStart = false;

              for (let k = 0; k < dbClassTimesList.length; k++) {
                if (k == 0 || k == dbClassTimesList.length - 1) {
                  newWeeks += dbClassTimesList[k];
                } else if (rangeStart) {
                  // add the start of the range
                  newWeeks += dbClassTimesList[k];
                  rangeStart = false;
                }

                while (dbClassTimesList[k + 1] == dbClassTimesList[k] + 1) {
                  // keep iterating until you reach the end of the range (numbers stop being consecutive)
                  k++;
                }
                if (!rangeStart) {
                  // add the end of the range (last consecutive number)
                  newWeeks += '-' + dbClassTimesList[k];
                  if (k !== dbClassTimesList.length - 1) {
                    // if this isn't the last week, we will need to add more weeks
                    newWeeks += ',';
                  }
                  // get ready to add the end of the range
                  rangeStart = true;
                }
              }
              dbClassTimesOne.weeks = newWeeks;
              dbClass.times.splice(dbClass.times.indexOf(dbClassTimesTwo), 1);
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
