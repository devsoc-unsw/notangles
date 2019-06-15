import express from 'express'
import * as indexController from './controllers/index'

const app = express()

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000)

/**
 * Express routes
 */
app.get('/', indexController.index)

export default app
