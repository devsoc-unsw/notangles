import { Request, Response } from 'express'
import Database from './database';
/**
 * GET /
 */
export let index = (req: Request, res: Response) => {
  res.send('Hello Notangles!')
}
