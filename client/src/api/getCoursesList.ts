import { CoursesList } from '../interfaces/CourseOverview'

const API_URL = 'http://localhost:3001/api'

export const getCoursesList = async (
  year: string,
  term: string
): Promise<CoursesList | null> => {
  const baseURL = `${API_URL}/terms/${year}-${term}`
  try {
    const data = await fetch(`${baseURL}/courses/`)
    return data.json()
  } catch (error) {
    console.error(error)
    return null
  }
}
