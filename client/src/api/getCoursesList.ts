import { CoursesList } from '../interfaces/CourseOverview'

const API_URL = 'http://localhost:3001/api'

/**
 * Fetches a list of course objects, where each course object contains 
 * the course id, the course code, and course name
 * 
 * @param year The year that the courses are offered in
 * @param term The term that the courses are offered in
 * @return A promise containing the list of course objects offered in the specified year and term
 * 
 * @example
 * const coursesList = await getCoursesList('2019', 'T3')
 */
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
