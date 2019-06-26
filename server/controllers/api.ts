import { Response, Request } from 'express'

/**
 * GET /api/course/:courseId
 */
export let getCourse = (req: Request, res: Response) => {
  res.send(req.params)
}
