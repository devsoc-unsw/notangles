import { Response, Request } from 'express'
import * as util from 'util'

import Database from '../dbApi'

interface IGetCourseParams {
  termId: string
  courseId: string
}

/**
 * GET /api/terms/:termId/courses/:courseId/
 */
export const getCourse = async (req: Request, res: Response) => {
  //termId expected in yyyy-term format
  const params: IGetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  Database.setDbname(year)
  const course = await Database.dbRead(term, params.courseId)
  if (course) {
    res.send(JSON.stringify(course.classes))
  } else {
    console.error(
      'dbRead returned null course. params: ' + util.inspect(params)
    )
    res.status(400).send('Invalid termId/courseId param')
  }
}

export const getCourseList = async (req: Request, res: Response) => {
  const params: IGetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  if (!(year && term)) {
    res.status(400).send('Invalid year and term: should be <year>-<term>')
    return
  }
  Database.setDbname(year)
  const list = await Database.dbFetchAll(term)
  if (list) {
    res.send(JSON.stringify(list))
  } else {
    console.error('Db fetch returned null ' + util.inspect(params))
    res.status(400).send('Could not find the required data')
  }
  return list
}
