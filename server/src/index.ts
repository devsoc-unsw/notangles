import { Request, Response } from 'express'

/**
 * GET /
 */
export let index = (req: Request, res: Response) => {
  res.send('Hello Notangles!')
}
