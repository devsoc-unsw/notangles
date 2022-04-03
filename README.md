# Notangles

[Notangles](https://notangles.csesoc.app/) is an interactive drag-and-drop timetable planner designed to help UNSW students plan their ideal weekly timetable.


## Background and Motivation

A few weeks before class registration opens, UNSW releases all of their class information at http://timetable.unsw.edu.au/2022. However, the classes and their respective times are formatted in a way that makes it difficult for students trying to plan out their classes before registrations open. Notangles aims to present this information in an easy to visualise and intuitive fashion, allowing students to plan out their timetable by simply dragging and dropping the classes that they are taking.

Students often find it hard to plan out their classes such that they end up in the same class as their friends. It can also be difficult to plan out times where they can meet up with their friends outside of class. Notangles aims to solve this problem through social timetabling, allowing users to view their friends’ timetables and to also plan out timetables collaboratively.

## Running Notangles on your Local Machine

### Prerequisites

Before you start, make sure that you have the following software installed.

- Git (standard on Linux) or GitHub Desktop
- Node.js and npm (usually bundled with Node.js)
- Docker (only needed if you are working on the back-end). [Instructions](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers) if you’re using WSL on Windows.

### Installing

Clone the repository:

`git clone git@github.com:csesoc/notangles.git`

Install dependencies by running:

`cd client && npm install && cd ..`

### Running the front-end

Navigate into `notangles/client`, then run one of the follow commands:

- `npm start` (if you already have the server running locally; connects to that)

- `npm run start:mock` (if you don’t have the server running locally; connects to our real server)

You can then access the client at `localhost:3000` in your favourite web browser.

### Running the back-end

(Skip this for now) Navigate into `notangles/server` and run `docker-compose up`. This runs the server and the database as a bundle.

(Start from here) After that, navigate to the `timetable-scraper` repo (which can be found [here](https://github.com/csesoc/timetable-scraper)) and run `npm start` to start the scraper’s server. To update the scraped data, run `npm run scraper`. This command should only need to be run once each term.

## Documentation

For more information, see our [Confluence space](https://compclub.atlassian.net/wiki/spaces/N/overview?homepageId=2142536957).
