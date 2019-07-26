import * as express from 'express'
import * as indexController from './controllers/index'
import * as apiController from './controllers/api'

const app = express()

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000)

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
app.get('/api/terms/:termId/courses/:courseId', apiController.getCourse)

export default app
