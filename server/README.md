## Server

This project allows for communication with the mongoDB database.

## Installation

To install the neccessary dependencies, run `npm install`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the backend
Allows the fronted to communicate with the mongoDB database.
This will not work unless the secret.json file is presented.
See secret.json below for more information.

### `npm test`

Launches the JEST tests.
Tests are not currently implemented.

## API endpoints

### GET /api/terms/:termId/courses/:courseId/

termId: is expected to be in yyyy-term format

term format is a capital letter followed by a number ie:- T3 or S1

Returns information about the specific course as a javascript object

### GET /api/terms/:termId/courses

termId: is expected to be in yyyy-term format

term format is a capital letter followed by a number ie:- T3 or S1

Returns a list of all courses that are running in the specified term and year as javascript objects where each element in the list represents a course

## Secret.json

Secret.json contains the url to access the database. without this, the backend cannot access the database.
For more information, contact
