import { DBCourse, dbCourseToCourseData } from '../interfaces/dbCourse'
import { CourseData } from '../interfaces/courseData'

const API_URL = 'http://localhost:3001/api'

export const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string
): Promise<CourseData | null> => {
  const ty = `${year}-${term}`
  try {
    const data = await fetch(
      `${API_URL}/terms/${year}-${term}/courses/${courseCode}/`
    )
    const json: DBCourse = await data.json()
    if (!json) {
      throw Error('Fetch did not get results')
    }

    return dbCourseToCourseData(json)
  } catch (error) {
    console.error(error)
    return null
  }
}
