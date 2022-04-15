# Onboarding

Welcome to CSESoc Projects and the Notangles team! This page will come in handy when you’re running Notangles locally, and working on your own features.

## Your setup

Your coding setup is yours and we’ll try our best to support that, although here’s some recommendations. First off, using a Linux or Linux-like OS (such as macOS) makes everything a lot easier, although you can get by on Windows.

I encourage fellow Windows users to install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (Windows Subsystem for Linux), which essentially lets you run a virtual Linux box inside your Windows OS with minimal hassle. (Bonus: install [Windows Terminal](https://www.microsoft.com/en-au/p/windows-terminal/9n0dx20hk701) for enhanced aesthetics.) Some of [this guide](https://www.abiram.me/wsl-github) may be useful.

Once you’ve got your OS setup, there’s the question of editor. This is a personal choice, but if you’re looking for advice, you can’t go wrong with [VS Code](https://code.visualstudio.com/).

We use GitHub for managing our source code, which you can use mainly with commands in the terminal. But [GitHub Desktop](https://desktop.github.com/) makes a lot of things easier if you’re not into that. However, you’ll probably need to learn the commands at some point in your career.

## Our stack

![Stack diagram](https://i.imgur.com/7Qo3tVD.png)

Currently, Notangles is made up of a front-end (the client) and a back-end (the server and scraper).

The client is what runs in a user’s web browser when they visit Notangles. It manages the UI and requests data from the server. It’s written in [TypeScript](https://www.typescriptlang.org/), and uses a UI library called [React](https://reactjs.org/), along with a component library called [Material-UI](https://material-ui.com/).

The server fetches data from the database and provides data to the client, and will implement features like logging in and adding friends. It’s also written in TypeScript. The runtime is [Node.js](https://nodejs.org/en/), which is an environment for executing JavaScript outside the browser, such as on a server. It uses a web server framework called [Express](https://expressjs.com/).

The scraper is currently written in TypeScript and runs in Node.js. It uses a library called Puppeteer, which simulates a web browser to download and extract data from [UNSW’s timetable website](http://timetable.unsw.edu.au/). We’re in the process of migrating this to a lighter-weight Python implementation, which will simply fetch and parse HTML data without actually rendering it in a simulated browser.

We’re using a database called MongoDB, which the scraper writes to and the server reads from. We’ll soon be migrating to another database server, like PostgreSQL.

These components are run on CSE machines in [Docker](https://www.docker.com/) containers. Docker makes running and deploying code much more portable, by simulating an OS and environment which behaves the same no matter what machine it’s running on.

## Prerequisites

Before you start, make sure that you have the following software installed.

- Git (standard on Linux) or [GitHub Desktop](https://desktop.github.com/)
- [Node.js](https://nodejs.org/en/download/package-manager/) and [npm](https://www.npmjs.com/) (usually bundled with Node.js)
- [Docker](https://www.docker.com/) (only needed if you are working on the back-end)
  - [Instructions if you’re using WSL on Windows](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers)


## Getting the source code

We manage our source code with a version control system called [Git](https://git-scm.com/). Every time we *commit* new code, it gets added to a history of commits, so we can get old code back if needed. This code is then hosted on [GitHub](https://github.com/csesoc/notangles), so any code you *push* is backed up, and can be *pulled* by other team members. Git has other features like branches, which allow us to work on different versions of the same codebase at the same time, and merge them together later.

First of all, make sure that you have been added to the [Notangles repository](https://github.com/csesoc/notangles) on GitHub. While anyone can read our open-source codebase, you’ll need permissions to push changes.

Once you’re in, summon a terminal and clone the repository by running `git clone git@github.com:csesoc/notangles.git`. (You can also use GitHub Desktop.) After that, navigate into the newly-cloned repository by running `cd notangles`.

Then, run `cd client && npm install && cd ../server && npm install && cd ../scraper && npm install && cd ..`, which installs all the dependencies that the project needs.

## Running the back-end

If you aren’t working on the back-end currently, you can skip this section.

Navigate into `notangles/server` and run `docker-compose up`. This runs the server and the database as a bundle.

After that, navigate into `notangles/scraper` and `npm start`, which runs the scraper which scrapes the course data from [UNSW’s timetable website](http://timetable.unsw.edu.au/) and injects it into the database. The scraper will spawn a large number of Chromium tabs to scrape the data, they should disappear after a while. We’ll soon be replacing the current scraper with a lighter-weight Python implementation.

## Running the front-end

Navigate into `notangles/client`, then run one of the follow commands:

- `npm start` (if you already have the server running locally; connects to that)
- `npm run start:mock` (if you don’t have the server running locally; connects to our real server)

You can then access the client at `localhost:3000` in your favourite web browser.

## Workflow

Notangles uses a [Trello board](https://trello.com/b/Cg6sIWgr/notangles) to track tasks, issues and features. There are a number of columns, including:

- General (put cards there if you’re unsure of which is the correct column)
- Ideas (anything that we brainstorm can go here)
- Meta (anything that doesn’t directly affect the product, like refactoring or documentation)

There’s also a number of other columns for larger features and goals we have. At the time of writing, there’s UI/UX improvement, social-timetabling, auto-timetabling, and mobile. We may add or remove these over time.

Most cards below the dividing line in each column are considered **to-do**. You may assign yourself to any issues you’d like to reserve doing in the future, and ones you’re currently working on.

If that issue becomes **in-progress**, place it above the line.

When you’re working on an issue, create a branch in Git with a name following one of these formats:

- `feature/<issue-name>` (for adding a new feature)
- `bugfix/<issue-name>` (for fixing a bug)
- `hotfix/<issue-id>` (for urgent fixes, e.g. security patches)

Then, push the branch to the Notangles repository by running `git push -u origin <branch-name>` (or by pushing on GitHub Desktop).

When you’re done with the issue, [create a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) on GitHub, then assign as reviewers the team lead, and members with experience in the area.

When your pull request has been approved and merged into the *dev* branch, you can archive the card on Trello. All archived cards can be referenced from “archived items”, under “more” in the Trello menu.

As a side note, **make sure to always pull from *dev*** before you do any work! This is so you can get the latest code to work on, with all the new changes from other team members.
