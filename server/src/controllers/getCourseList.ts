import { Response, Request } from 'express'
import * as util from 'util'

import Database from '../database'
import { dbFetchAllParams } from '../database'
import { GetCourseParams } from '../../interfaces/GetCourseParams'

/**
 * GET /api/terms/:termId/courses
 * termId expected in yyyy-term format
 */
export const getCourseList = async (req: Request, res: Response) => {
    const params: GetCourseParams = req.params
    const [year, term] = params.termId.split('-')
    if (!(year && term)) {
      res.status(400).send('Invalid year and term: should be <year>-<term>')
      return
    }
    const args : dbFetchAllParams = {
      dbName : year,
      termColName : term
    }
    const list = await Database.dbFetchAll(args)
    if (list) {
      res.send(JSON.stringify(list))
    } else {
      console.error('Db fetch returned null ' + util.inspect(params))
      res.status(400).send('Could not find the required data')
    }
    return list
  }