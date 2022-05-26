# Notangles Server 💯

The Notangles server allows the client to communicate with the database and the autotimetabling server.

## Installation

- npm v8.8.0
- node v18.1.0

In the root server directory `server`, run `npm install` to install all the dependencies.

## Running

First, make sure you have started Docker via Docker Desktop on your machine. Then, run `docker-compose up` to start the server locally. The server will be hosted at http://localhost:3001.

To visually inspect the database, install [MongoDB Compass](https://www.mongodb.com/products/compass) and connect to `mongo://localhost:27017`.

## Tech Stack

The Notangles server uses:

- [Nest.js](https://nestjs.com/)
- [MongoDb](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)

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

## Environment variables required

Please check the Vault for the contents of the `.env` file and copy it into a file called `.env` in `/server`. Without these environment variables, the server will not run.
