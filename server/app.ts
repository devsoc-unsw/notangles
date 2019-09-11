import * as express from 'express'
import * as indexController from './controllers/index'
import * as apiController from './controllers/api'

const app = express()

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000)

/**
 * Express routes
 */
app.get('/', indexController.index)
app.get('/api/terms/:termId/courses/:courseId', apiController.getCourse)

export default app
