const ics = require('ics');
import { firstMomentOfTerm } from "../constants/timetable";
import dayjs from 'dayjs';
import { CourseData, SelectedClasses, EventDetails } from "../interfaces/Course";
import { saveAs } from 'file-saver';
import { DateArray } from "ics";

/**
 * makes a request to download an ICS file which corresponds to the data the user input
 * @param courses global course data
 * @param classes global classes data
 * @returns 
 */
export function downloadIcsFile (courses: CourseData[], classes: SelectedClasses) : void {
    if (classes === null) {
        return;
    }
    const icsFile = getAllEvents(courses, classes).map((eventDetails) =>
        ics.createEvent({
            start: generateDateArray(eventDetails.period.time.start, eventDetails.period.time.day, eventDetails.week),
            end: generateDateArray(eventDetails.period.time.end, eventDetails.period.time.day, eventDetails.week),
            title: `${eventDetails.period.class.course.code} ${eventDetails.period.class.activity}`,
            location: eventDetails.period.locations[0]
        })
    ).map((obj) => obj.value);
    saveAs(new Blob([icsFile.join("\n")], {type: 'text/ics'}), "notangles.ics");
}

function generateDateArray(hour: number, day: number, week: number): DateArray {
    // 0 index days and weeks
    let currDate = dayjs(firstMomentOfTerm).add(week - 1, 'w').add(day - 1, 'd').add(hour, 'h');
    return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
}

/**
 * @param courses the global course data
 * @param classes the global class data
 * @returns all the extrapolated events that occur in that term
 */
function getAllEvents(courses: CourseData[], classes: SelectedClasses): EventDetails[] {
    let allClasses = courses.flatMap((course) =>
        Object.keys(course.activities).filter((possibleActivity) => (
            classes[course.code] !== null && classes[course.code][possibleActivity] !== null
        ))
        .map((activities) => classes[course.code][activities])
    );
    return allClasses.flatMap(
        (classTime) => (
            // this cant actually be null, i just filtered it, ts is dumb
            classTime!.periods.flatMap((period) => (
                    period.time.weeks.map((week) => (
                        {
                            period: period,
                            week: week
                        })
                    )
                )
            )
        )
    )
}