const express = require('express')
const app = express();

/**
 * Express configuration
 */ 
app.set("port", process.env.PORT || 3000);

/**
 * Express routes
 */
app.get('/', (req, res) => {
  res.send('Hello World!')
});

export default app;