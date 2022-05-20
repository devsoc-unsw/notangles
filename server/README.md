# Notangles Server 💯

The Notangles server allows the client to communicate with the database and the autotimetabling server

## Installation

- npm v8.8.0
- node v18.1.0

In the root server directory `server`, run `npm install` to install all the dependencies.

## Running the app

Run `npm run start:dev` to start the server locally. The server will be hosted at http://localhost:3001

## Tech Stack

The Notangles server uses

- [Nest.js](https://nestjs.com/)
- [MongoDb](https://www.mongodb.com/)

## Stuff to know

- Nest.js is basically what Django is to Python. Like a thicc-er version of Express.
- Nest has 3 main types of files:
  - [Controller](https://docs.nestjs.com/controllers)
  - [Service (which are a type of Provider)](https://docs.nestjs.com/providers)
  - [Module](https://docs.nestjs.com/modules)
- We have 3 main modules, each containing at least 1 of each of the above types of files.
  - `src/sum` (The example one to look at if you haven't used Nest before.)
  - `src/auth` (Handles authentication with our )
  - `src/auto` (Handles auto-timetabling)

## Enviornment variables required

Without these environment variables stored in a `.env` file, the server will not run. Check the Deployment Guide on our Confluence to get the values of these environment variables.

```bash
OAUTH2_CLIENT_ID
OAUTH2_CLIENT_SECRET
OIDC_ISSUER_BASE_URL
OAUTH2_REDIRECT_URI
OAUTH2_SCOPES
SESSION_SECRET
PORT
```
