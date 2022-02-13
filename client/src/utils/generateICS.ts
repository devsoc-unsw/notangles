const ics = require('ics');
import { firstMomentOfTerm } from "../constants/timetable";
import dayjs from 'dayjs';
import { CourseData, SelectedClasses } from "../interfaces/Course";
import { saveAs } from 'file-saver';
import { DateArray } from "ics";

export function downloadIcsFile (courses: CourseData[], classes: SelectedClasses) : void {
    if (classes === null) {
        return;
    }
    let allClasses = courses.flatMap((course) =>
        Object.keys(course.activities).filter((possibleActivity) => (
            classes[course.code] !== null && classes[course.code][possibleActivity] !== null
        ))
        .map((activities) => classes[course.code][activities])
    );
    console.log(classes);
    let icsFile = allClasses.flatMap(
        (classTime) => (
            // this cant actually be null, i just filtered it, ts is dumb
            classTime!.periods.flatMap((period) => (
                    period.time.weeks.map((week) => (
                        ics.createEvent({
                            start: generateDateArray(period.time.start, period.time.day, week),
                            end: generateDateArray(period.time.start, period.time.day, week),
                            title: `${classTime!.id.replace("-", " ")}`,
                            location: period.locations[0]
                        })
                    ))
                )
            )
        )
    ).map((obj) => obj.value);
    saveAs(new Blob([icsFile.join("\n")], {type: 'text/ics'}), "notangles.ics");
}

function generateDateArray(hour: number, day: number, week: number): DateArray {
    let currDate = dayjs(firstMomentOfTerm).add(week - 1, 'w').add(day - 1, 'd').add(hour, 'h');
    return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
}