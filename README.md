# Notangles

[Notangles](https://notangles.csesoc.app/) is an interactive drag-and-drop timetable planner designed to help UNSW students plan their ideal weekly timetable.

## Background and Motivation

A few weeks before class registration opens, UNSW releases all of their class information at http://timetable.unsw.edu.au/2024. However, the classes and their respective times are formatted in a way that makes it difficult for students trying to plan out their classes before registrations open. Notangles aims to present this information in an easy to visualise and intuitive fashion, allowing students to plan out their timetable by simply dragging and dropping the classes that they are taking.

Students often find it hard to plan out their classes such that they end up in the same class as their friends. It can also be difficult to plan out times where they can meet up with their friends outside of class. Notangles aims to solve this problem through social timetabling, allowing users to view their friends’ timetables and to also plan out timetables collaboratively.

## Running Notangles on your Local Machine

### Prerequisites

Before you start, make sure that you have the following software installed.

- Git (standard on Linux) or GitHub Desktop
- Node.js and pnpm (install with `npm i -g pnpm`)
- Python

### Setup

Clone the repository:

`git clone git@github.com:devsoc-unsw/notangles.git`

### Running the front-end

Navigate into `/client`, install packages with `pnpm i`, then run one of the follow commands:

- `pnpm start` (if you already have the timetable server running locally; connects to that)

- `pnpm run start:mock` (if you don’t have the timetable server running locally; connects to our real server)

If you need to test the autotimetabler, both `pnpm start` and `pnpm run start:mock` will connect to the local autotimetabling server. Make sure to start it up with the steps below.

You can then access the client at `http://localhost:5173` in your favourite web browser.

### Running the back-end

Navigate into `/server`, install packages with `pnpm i`, then run `pnpm start`. The server will be hosted at `http://localhost:3001`

### Running the auto-timetabler

Navigate into `/auto_server`, setup a virtual environment, install the required Python packages with `pip install -r requirements.txt`, then start the server with `python server.py`.

## Documentation

For more information, see our [Confluence space](https://devsoc.atlassian.net/wiki/spaces/N/overview?homepageId=1572869).
