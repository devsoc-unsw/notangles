const ics = require('ics')
import { firstMomentOfTerm } from "../constants/timetable";
import dayjs from 'dayjs';
import { CourseData, SelectedClasses } from "../interfaces/Course";
import { saveAs } from 'file-saver';

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

    let icsFile = allClasses.flatMap((classTime) => (
        // this cant actually be null, i just filtered it, ts is dumb
        classTime!.periods.flatMap((period) => (
            period.time.weeks.map((week) => (
                ics.createEvent({
                    start: generateDateArray(week, period.time.start, period.time.day),
                    end: generateDateArray(week, period.time.end, period.time.day),
                    title: `${classTime!.course.code} ${classTime!.id}`,
                    location: period.locations[0]
                })
            ))
        ))
    )).map((obj) => obj.value);
    const blob = new Blob([icsFile.join("\n")])
    saveAs(blob, "notangles.ics");
}

const generateDateArray = (week: number, time: number, day: number): [number, number, number, number, number] => {
    let date = dayjs(firstMomentOfTerm).add(week, 'week').add(day, 'day').add(time, 'minute');
    return [date.year(), date.month(), date.day(), date.hour(), date.minute()]
}