import { ClassData, ClassPeriod, CourseData, InventoryData, InventoryPeriod } from '../interfaces/Periods';

/**
 * @param selectedCourses The currently selected courses
 * @param data The current class's data
 * @returns The course data for the course associated with a particular class
 */
export const getCourseFromClassData = (selectedCourses: CourseData[], data: ClassData | InventoryData) => {
  return selectedCourses.find((course) => course.code === data.courseCode)!;
};

/**
 * @param selectedCourses The currently selected courses
 * @param period The current period's data
 * @returns The class data for the class associated with a particular period
 */
export const getClassDataFromPeriod = (selectedCourses: CourseData[], period: ClassPeriod | InventoryPeriod) => {
  const course = selectedCourses.find((course) => course.code === period.courseCode);
  return course!.activities[period.activity].find((classData) => classData.id === period.classId)!;
};
