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

Navigate into `/client`, then run one of the follow commands:

- `npm start` (if you already have the timetable server running locally; connects to that)

- `npm run start:mock` (if you don’t have the timetable server running locally; connects to our real server)

You can then access the client at `localhost:3000` in your favourite web browser.

### Running the back-end

Navigate into `/server`, install packages with `npm i`, then run `npm run start`. 

### Running the auto-timetabler

Navigate into `/auto_server`, install the required Python packages with `pip install -r requirements.txt`, then start the server with `python server.py`.

## Documentation

For more information, see our [Confluence space](https://compclub.atlassian.net/wiki/spaces/N/overview?homepageId=2142536957).
