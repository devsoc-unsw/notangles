import { ClassData, ClassPeriod, CourseData, InventoryData, InventoryPeriod } from '../interfaces/Periods';

/**
 * @param selectedCourses The currently selected courses
 * @param data The current class's data
 * @returns The course data for the course associated with a particular class
 */
export const getCourseFromClassData = (selectedCourses: CourseData[], data: ClassData | InventoryData) => {
  const course = selectedCourses.find((course) => course.code === data.courseCode);
  if (course) {
    return course;
  } else {
    throw new Error();
  }
};

/**
 * @param selectedCourses The currently selected courses
 * @param period The current period's data
 * @returns The class data for the class associated with a particular period
 */
export const getClassDataFromPeriod = (selectedCourses: CourseData[], period: ClassPeriod | InventoryPeriod) => {
  const course = selectedCourses.find((course) => course.code === period.courseCode);
  if (!course) throw new Error();

  const classData = course.activities[period.activity].find((classData) => classData.id === period.classId);
  if (!classData) throw new Error();

  return classData;
};
