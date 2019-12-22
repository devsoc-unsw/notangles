# CSESoc Projects - Notangles - Scraper

CSESoc Projects Notables Course Scraper

This project contains a script that gathers class times and offerings of all courses offered at UNSW, in a specified study period. This information is retrieved from http://timetable.unsw.edu.au. The information collected is then written to a database. 

## Installation

This project has been verified to work with the following versions of node:
-   node: 
    1. 12.14.0
-   npm:
    1. 6.13.4


While in the project directory ```notangles/scraper```, run:
```
npm install
```

## Running the Script

While in the project directory, run:
```
npm start
```

## Tech Stack:
The notangles web-scraper uses:
* [Puppeteer](https://github.com/puppeteer/puppeteer)
* [TypeScript](https://www.typescriptlang.org/)
* [Lodash](https://lodash.com/)

## How it works
### The Data
[timetable.unsw.edu.au](https://timetable.unsw.edu.au/) is the website where timetable information about all unsw courses is stored. It has one page per course offered per year. 
Each page is further divided into subsections detailing all classes per term.
There is also a subsection that provides a list of timings and location for each of the classes.

### The 
The web-scraper is simply in two parts:
1. Scrape data from a

Puppeteer - the chromium headless browser, is used to n 