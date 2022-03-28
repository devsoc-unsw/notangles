import * as express from 'express';
import * as indexController from './index';
import {  getHello } from './controllers/index';
import { Response, Request } from 'express';

var bodyParser = require('body-parser')
var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())
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
app.get('/', indexController.index);
app.get('/api/himom/:message', (req, res)=> {
  res.send(JSON.stringify({your: req.params.message}))
})
// app.get('/himom/:message', getHello)
app.post('/himom', getHello)
// app.get('/api/terms/:termId/courses/:courseId', getHello);
// app.get('/api/terms/:termId/courses', getHello);

// app.get('/api/terms/:termId/courses', (req: Request, res: Response) => {
//   res.send('Hello Notangles!');
// });

export default app
