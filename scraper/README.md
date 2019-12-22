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
UNSW stores timetable-related information about all courses offered on [timetable.unsw.edu.au](https://timetable.unsw.edu.au/).
* The site has at most one page per course offered per year. 
Each page is further divided into subsections detailing all classes per term.
There is also a subsection that provides a list of timings and location for each of the classes.

* The site also has a page which contains a links to pages for each subject area (COMP, ARTS, ECON etc). Which in turn contain the links to each page that provide information about one or two courses.

### The Scraper
The web-scraper has two parts:
1. Scrape data from a page.
    * Based on the strucure of the page, the scraper parses each subsection and converts the data on the page to an array of JSON objects with the following format: (Example data from COMP1511 offered in term 1 2019)
    ```
    [
        {
            "courseCode": "COMP1511",
            "name": "Programming Fundamentals",
            "school": "School of Computer Sci & Eng",
            "campus": "Sydney",
            "career": "Undergraduate",
            "termsOffered": [
                "T1",
                "T2",
                "T3"
            ],
            "censusDates": [
                "17-MAR-2019",
                "30-JUN-2019",
                "13-OCT-2019"
            ],
            "classes": [
            {
                "classID": 9596,
                "section": "1UGA",
                "term": "T1",
                "activity": "Lecture",
                "status": "Open",
                "courseEnrolment": {
                    "enrolments": 339,
                    "capacity": 497
                },
                "termDates": {
                    "start": "18/02/2019",
                    "end": "19/05/2019"
                },
                "mode": "In Person",
                "times": [
                    {
                        "day": "Tue",
                        "time": {
                            "start": "09:00",
                            "end": "11:00"
                        },
                        "weeks": "1-10",
                        "location": "Central Lecture Block 7 (K-E19-104)"
                    },
                    {
                        "day": "Tue",
                        "time": {
                            "start": "11:00",
                            "end": "13:00"
                        },
                        "weeks": "11",
                        "location": "Central Lecture Block 7 (K-E19-104)"
                    },
                    {
                        "day": "Thu",
                        "time": {
                            "start": "11:00",
                            "end": "13:00"
                        },
                        "weeks": "1-9",
                        "location": "Central Lecture Block 7 (K-E19-104)"
                    }
                ],
                "notes": "This class is initially reserved for new students"
            }
        }
    ]
    ```
    Note: The data is an array of JSON objects as there may be details about more than one course on one page.
    
2. Visit each page of the website so that every course can be scraped.
    * Puppeteer - the chromium headless browser, is used to automate this process. First it visits each page on a subject area, then obtains link urls to each of the course pages and then visits each course page.
    It opens each page on the website in a separate tab. To improve speed, it opens 50 tabs at once.
    
    * Once it finishes scraping the site, it then groups the courses into 6 terms:
    ```Summer, T1, T2, T3, S1 and S2```

    * The scraper also checks the data for any errors. If it finds data that is not in the expected format, it makes a copy of the data that it thinks is erroneous and adds it to a list of warnings. This list of warnings is then returned to the caller. Each warning is tagged with a warning tag and a simple warning message.

### Database Integration
There is a convenience function provided in the file writeToDb.ts which uses the Database api from ```notangles/server``` to write to the MongoDB database