import { config } from 'dotenv';

config();

import express from 'express';
import { auth } from 'express-openid-connect';
import logger from 'morgan';

// Create a new express application instance
const app = express();

// The port the express app will listen on
const port = process.env.PORT || 3000;

// Load the express middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(auth());

// Basic route
app.get('/', (req, res) => res.send('Hello World!'));

// Start the express server
app.listen(port, () => console.log(`server started at http://localhost:${port}`));
