# Notangles

[Notangles](https://notangles.devsoc.app/) is an interactive drag-and-drop timetable planner designed to help UNSW students plan their ideal weekly timetable.

## Background and Motivation

A few weeks before class registration opens, UNSW releases all of their class information at http://timetable.unsw.edu.au. However, the classes and their respective times are formatted in a way that makes it difficult for students trying to plan out their classes before registrations open. Notangles aims to present this information in an easy to visualise and intuitive fashion, allowing students to plan out their timetable by simply dragging and dropping the classes that they are taking.

Students often find it hard to plan out their classes such that they end up in the same class as their friends. It can also be difficult to plan out times where they can meet up with their friends outside of class. Notangles aims to solve this problem through social timetabling, allowing users to view their friends’ timetables and to also plan out timetables collaboratively.

## Running Notangles on your Local Machine

### Prerequisites

Before you start, make sure that you have the following software installed.

- Git (standard on Linux) or GitHub Desktop
- Node.js and pnpm (install with `npm i -g pnpm`)
- Python
- Docker Desktop

### Setup

Clone the repository:

`git clone git@github.com:devsoc-unsw/notangles.git`

> Follow README.md files in `client`, `server`, and `auto_server` subdirectories to setup the notangles application.

## Documentation

For more information, see our [Confluence space](https://devsoc.atlassian.net/wiki/spaces/N/overview?homepageId=1572869).

## Quick Start

### Server (`/server`)

1. Configure environment & authentication:
   - Copy the template and fill in the values: `cp .env.example .env`
   - (Optional) To enable real OAuth login, create an OAuth app with a provider
     (GitHub or Google) and set its Client ID / Secret and redirect
     URI in `.env`. Guest login works without any OAuth setup.

2. Install and run:

   ```bash
   cd server
   pnpm i
   docker compose up -d      # start the Postgres container
   pnpm prisma generate      # generate the Prisma client
   pnpm prisma migrate dev   # apply migrations (create tables)
   pnpm run graphql          # generate GraphQL types
   pnpm run start
   ```

### Client (`/client`)

```bash
cd client
pnpm i
pnpm run start
```