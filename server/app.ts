import db from './db_api'

import express from 'express'
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Server listening on port ' + port)
})
