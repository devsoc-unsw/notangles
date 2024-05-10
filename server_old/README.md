# Notangles Server

The Notangles server allows the client to communicate with the autotimetabling server.

## Installation

The server has been verified to work with:

- npm v8.3.1
- node v16.14.0

In the root server directory `server`, run `npm install` to install all the dependencies.

## Running

Run `npm start` to start the server locally. The server will be hosted at http://localhost:3001.

## Tech Stack

The Notangles server uses:

- [MongoDB](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)

## API endpoints

### `POST /auto`

Returns a list of ints that correspond to class times for the inputted data
