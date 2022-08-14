import { ClassData, ClassPeriod, CourseData, InventoryData, InventoryPeriod } from '../interfaces/Periods';

export const getCourseFromClassData = (selectedCourses: CourseData[], data: ClassData | InventoryData) => {
  return selectedCourses.find((course) => course.code === data.courseCode)!;
};

export const getClassDataFromPeriod = (selectedCourses: CourseData[], period: ClassPeriod | InventoryPeriod) => {
  const course = selectedCourses.find((course) => course.code === period.courseCode);
  return course!.activities[period.activity].find((classData) => classData.id === period.classId)!;
};
