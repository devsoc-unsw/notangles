import { DBCourse, dbCourseToCourseData } from '../interfaces/DbCourse'
import { CourseData } from '../interfaces/CourseData'

const API_URL = 'http://localhost:3001/api'

export const getCourseInfo = async (
  year: string,
  term: string,
  courseCode: string
): Promise<CourseData | null> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`
  try {
    const data = await fetch(`${baseURL}/courses/${courseCode}/`)
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
