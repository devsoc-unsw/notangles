import { ClassData, CourseData, SelectedClasses } from '../interfaces/Course';
import timeoutPromise from '../utils/timeoutPromise';
import { API_URL } from './config';
import NetworkError from '../interfaces/NetworkError';
// import TimeoutError from '../interfaces/TimeoutError';
import { AutoRequest, AutoCourse, Criteria } from '../interfaces/AutoRequest';
import { term, year } from '../constants/timetable';

/**
 *
 * @param selectedClasses selected classes
 * @param selectedCourses selected courses
 */
const autoTimetable = async (
  selectedClasses: SelectedClasses,
  selectedCourses: CourseData[],
  criteria: Criteria,
): Promise<ClassData[]> => {
  const courses: AutoCourse[] = [];

  selectedCourses.forEach((selectedCourse) => {
    const autoCourse: AutoCourse = {
      code: selectedCourse.code,
      exclude: [],
    };
    Object.entries(selectedCourse.activities).forEach(([activity]) => {
      if (selectedClasses[selectedCourse.code][activity] == null) {
        autoCourse.exclude = [...autoCourse.exclude, activity];
      }
    });
    courses.push(autoCourse);
  });

  const request: AutoRequest = {
    courses,
    year: Number(year),
    term,
    criteria,
  };

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  };

  try {
    const data = await timeoutPromise(1000, fetch(`${API_URL}/auto`, requestOptions));
    if (data.status === 400) {
      throw new NetworkError('Internal server error');
    }
    const classData = await data.json();
    const output: ClassData[] = [];
    courses.forEach((autoCourse) => {
      const course = selectedCourses.find((c) => c.code === autoCourse.code);
      if (course === undefined) throw new NetworkError('Internal server error');
      Object.entries(course.activities).forEach(([activity, activityClasses]) => {
        if (!autoCourse.exclude.includes(activity)) {
          const outputClass = activityClasses.find((c) => (
            c.classId === classData[course.code][activity]
          ));
          console.log(outputClass)
          if (outputClass !== undefined) {
            output.push(outputClass);
          } else {
            throw new NetworkError('Internal server error');
          }
        }
      });
    });
    return output;
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default autoTimetable;
