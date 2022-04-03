import { createEvent } from 'ics';
import { firstDayOfTerm } from "../constants/timetable";
import dayjs from 'dayjs';
import { CourseData, SelectedClasses, ClassPeriod } from "../interfaces/Course";
import { saveAs } from 'file-saver';
import { DateArray } from "ics";

/**
 * makes a request to download an ICS file which corresponds to the data the user input
 * @param courses global course data
 * @param classes global classes data
 * @returns 
 */
export async function downloadIcsFile(courses: CourseData[], classes: SelectedClasses): Promise<void> {
  if (classes === null) {
    return;
  }
  const icsFile = getAllEvents(courses, classes).map(async ([period, week]) =>
    createEvent({
      start: await generateDateArray(period.time.start, period.time.day, week),
      end: await generateDateArray(period.time.end, period.time.day, week),
      title: `${period.class.course.code} ${period.class.activity}`,
      location: period.locations[0]
    })
  ).map(async (obj) => (await obj).value);
  saveAs(new Blob([(await Promise.all(icsFile)).join("\n")], { type: 'text/ics' }), "notangles.ics");
}

async function generateDateArray(hour: number, day: number, week: number): Promise<DateArray> {
  // 0 index days and weeks
  let currDate = (await getFirstMomentOfTerm()).add(week - 1, 'w').add(day - 1, 'd').add(hour, 'h');
  return [currDate.year(), currDate.month() + 1, currDate.date(), currDate.hour(), currDate.minute()];
}

/**
 * @param courses the global course data
 * @param classes the global class data
 * @returns all the extrapolated events that occur in that term
 */
export function getAllEvents(courses: CourseData[], classes: SelectedClasses) {
  // NOTE: this function may be useful in other applications, if so, move it to a more reasonably named file.
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
          [period, week] as [ClassPeriod, number])
        )
      ))
    )
  )
}
/**
 * @returns the first moment of term in UTC
 */
async function getFirstMomentOfTerm() {
  // i hope that the country and city we live in doesnt need to change
  const timezoneData = (await (await fetch("http://worldtimeapi.org/api/timezone/Australia/Sydney")).json());
  return dayjs(firstDayOfTerm + `T00:00:00.000Z`).subtract(parseInt(timezoneData.utc_offset), 'h');
}
