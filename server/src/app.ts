import * as express from 'express'
import * as indexController from './index'
import { getCourse, getCourseList } from './controllers/index'

const app = express()

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3001)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

/**
 * Express routes
 */
app.get('/', indexController.index)
app.get('/api/terms/:termId/courses/:courseId', getCourse)
app.get('/api/terms/:termId/courses', getCourseList)

export default app
