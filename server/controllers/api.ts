import { Response, Request } from 'express'

/**
 * GET /api/course/:courseId
 */
export const getCourse = (req: Request, res: Response) => {
  res.send(req.params)
}
