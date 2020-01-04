import { Response, Request } from 'express'
import * as util from 'util'

import Database from '../database'
import { dbReadParams } from '../../interfaces/params'
import { GetCourseParams } from '../../interfaces/GetCourseParams'

/**
 * GET /api/terms/:termId/courses/:courseId/
 * termId expected in yyyy-term format
 */
export const getCourse = async (req: Request, res: Response) => {
  const params: GetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  const args : dbReadParams = {
    dbName : year,
    termColName : term,
    courseCode : params.courseId
  }
  const course = await Database.dbRead(args)
  if (course) {
    res.send(JSON.stringify(course))
  } else {
    console.error(
      'dbRead returned null course. params: ' + util.inspect(params)
    )
    res.status(400).send('Invalid termId/courseId param')
  }
}