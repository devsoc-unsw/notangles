import { Response, Request } from 'express'
import db from '../dbApi'

interface IGetCourseParams {
  courseId: string
}

/**
 * GET /api/course/:courseId/
 */
export const getCourse = async (req: Request, res: Response) => {
  const params: IGetCourseParams = req.params
  const course = await db.dbRead(params.courseId)
  res.send(course)
}
