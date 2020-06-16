import { CourseHead, CourseWarning, ClassWarnings } from '../../interfaces'

interface GetCourseWarningsFromClassWarnings {
  classWarnings: ClassWarnings[]
  courseHead: CourseHead
}

/**
 * Converts class warnings to course warnings to give more information for debugging
 * @param { CourseHead } courseHead: The course name and course code required for the conversion as a course head object
 * @param { ClassWarnings } classWarnings: The classwarnings to be converted
 * @returns { CourseWarning[] }
 */
const getCourseWarningsFromClassWarnings = ({
  classWarnings,
  courseHead,
}: GetCourseWarningsFromClassWarnings): CourseWarning[] => {
  if (!courseHead) {
    throw new Error('Invalid course code and name')
  }

  // Encapsulate the classWarnings into courseWarnings for the course
  // by adding
  const courseWarnings: CourseWarning[] = []
  for (const classWarn of classWarnings) {
    const courseWarning: CourseWarning = {
      courseCode: courseHead.courseCode,
      courseName: courseHead.name,
      ...classWarn,
    }
    courseWarnings.push(courseWarning)
  }

  return courseWarnings
}

export { getCourseWarningsFromClassWarnings }
