import { Response, Request } from 'express'
import * as util from 'util'

import db from '../dbApi'

interface IGetCourseParams {
  termId: string
  courseId: string
}

/**
 * GET /api/terms/:termId/courses/:courseId/
 */
export const getCourse = async (req: Request, res: Response) => {
  const params: IGetCourseParams = req.params
  const course = await db.dbRead(params.termId, params.courseId)

  if (course) {
    res.send(course)
  } else {
    console.error(
      'dbRead returned null course. params: ' +
        util.inspect(params, { showHidden: false, depth: null })
    )
    res.status(400).send('Invalid termId/courseId param')
  }
}
