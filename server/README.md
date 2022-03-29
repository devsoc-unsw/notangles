# Notangles Server

The Notangles server allows other components to interact with the mongoDB database. In particular, it allows the client to read from the database and the scraper to write and update the database.

## Installation

This project has been verified to work with:

- npm:
  - 6.12.1
- node:
  - 12.13.1

While in the project directory `notangles/server`, run:
`npm install`

## Running

For the node server, while in the project directory, run:
`npm start` or `npm run start`

For the python server, navigate from the project directory to `python_server`, and run:
`python autotimetabler_server.py`
Note: you may need to install grpc with `python -m pip install grpcio`

## Tech Stack

The Notangles server uses:

- [MongoDB](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)

## How it is used

The Notangles Server provides 2 API endpoints that are used by the client project. This allows the client project to read information from the mongoDB databbase. In addition, the server defines an API that is used by the Scraper. This API contains functions to read, write and update the database. See `notangles/server/src/database.ts` for more information. For the server project to work, a valid `secret.json` file must be placed `notangles/server/src`. For more information about the `secret.json` file, see the Secret.json section below

### API endpoints

#### `GET /api/terms/:termId/courses/:courseId/`

termId: is expected to be in yyyy-term format

term format is a capital letter followed by a number ie:- T3 or S1

Returns information about the specific course as a javascript object

#### `GET /api/terms/:termId/courses`

termId: is expected to be in yyyy-term format

term format is a capital letter followed by a number ie:- T3 or S1

Returns a list of all courses that are running in the specified term and year as javascript objects where each element in the list represents a course

#### `POST /auto`

Returns a list of ints that correspond to class times for the inputed data

### Secret.json

The `secret.json` file located in `notangles/server/src` should contain links to a mongoDB database in the format:

`{`
`"dev": url`
`"staging": url`
`"prod": url`
`}`

In order to choose which link is to be used, change the last line in `notangles/server/src/config.ts` accordingly. ie:-

- For dev
  - `export const config: IConfig = allConfig[process.env.NODE_ENV || Env.DEV]`
- For staging
  - `export const config: IConfig = allConfig[process.env.NODE_ENV || Env.STAGING]`
- For prod
  - `export const config: IConfig = allConfig[process.env.NODE_ENV || Env.PROD]`

Note, anything that uses the server will not work if a valid `secret.json` is not present. Due to the url providing access to the mongoDB database, `secret.json` is git ignored and is not publicly accessible.
