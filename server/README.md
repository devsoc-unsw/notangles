# Notangles Server

The Notangles server allows the client to communicate with the autotimetabling server.

## Installation

The server has been verified to work with:

- npm v8.3.1
- node v16.14.0

In the root server directory `server`, run `npm install` to install all the dependencies.

## Environment Variables

To run this project, you will need the following environment variables:

| Variable                            | Default | Value                                                                  |
| ----------------------------------- | ------- | ---------------------------------------------------------------------- |
| `SENTRY_INGEST_SERVER_FRONTEND`     | Secret  | The ingest url for sentry SDK to know where to send the monitored data |
| `SENTRY_TRACE_RATE_SERVER_FRONTEND` | 0.6     | Percentage of transactions monitored and sent                          |

## Running

Run `npm start` to start the server locally. The server will be hosted at http://localhost:3001.

## Tech Stack

The Notangles server uses:

- [MongoDB](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)

## API endpoints

### `POST /auto`

Returns a list of ints that correspond to class times for the inputed data
