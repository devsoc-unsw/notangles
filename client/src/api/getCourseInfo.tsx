import { DBCourse, dbCourseToCourseData } from '../interfaces/dbCourse'
import { CourseData } from '../interfaces/courseData'

export const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string
): Promise<CourseData | null> => {
  const ty = year + '-' + term
  try {
    const data = await fetch(
      'http://localhost:3001/api/terms/' + ty + '/courses/' + courseCode + '/'
    )
    const json: DBCourse = await data.json()
    if (json == null) {
      throw Error('Fetch did not get results')
    }

    return dbCourseToCourseData(json)
  } catch (error) {
    console.error(error)
    return null
  }
}
