"use strict";
exports.__esModule = true;
exports.dbCourseToCourseData = void 0;
var locationShorten = function (location) { return location.split(' (')[0]; };
var weekdayToNumber = function (weekDay) {
    var conversionTable = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5
    };
    return conversionTable[weekDay];
};
var timeToNumber = function (time) {
    var _a = time.split(':').map(function (part) { return Number(part); }), hour = _a[0], minute = _a[1];
    return hour + minute / 60;
};
/**
 * An adapter that formats a DBTimes object to a Period object
 *
 * @param dbTimes A DBTimes object
 * @return A Period object which is converted from the DBTimes object
 *
 * @example
 * const periods = dbClass.times.map(dbTimesToPeriod)
 */
var dbTimesToPeriod = function (dbTimes) { return ({
    location: dbTimes.location,
    locationShort: locationShorten(dbTimes.location),
    time: {
        day: weekdayToNumber(dbTimes.day),
        start: timeToNumber(dbTimes.time.start),
        end: timeToNumber(dbTimes.time.end),
        weeks: dbTimes.weeks
    }
}); };
/**
 * An adapter that formats a DBCourse object to a CourseData object
 *
 * @param dbCourse A DBCourse object
 * @return A CourseData object
 *
 * @example
 * const data = await fetch(`${baseURL}/courses/${courseCode}/`)
 * const json: DBCourse = await data.json()
 * const courseInfo = dbCourseToCourseData(json)
 */
exports.dbCourseToCourseData = function (dbCourse) {
    var courseData = {
        code: dbCourse.courseCode,
        name: dbCourse.name,
        activities: {},
        latestFinishTime: 0
    };
    dbCourse.classes.forEach(function (dbClass, index) {
        var classData = {
            id: dbCourse.courseCode + "-" + dbClass.activity + "-" + index,
            course: courseData,
            activity: dbClass.activity,
            periods: dbClass.times.map(dbTimesToPeriod),
            enrolments: dbClass.courseEnrolment.enrolments,
            capacity: dbClass.courseEnrolment.capacity
        };
        classData.periods.forEach(function (period) {
            if (period.time.end > courseData.latestFinishTime) {
                courseData.latestFinishTime = period.time.end;
            }
        });
        if (!(dbClass.activity in courseData.activities)) {
            courseData.activities[dbClass.activity] = [];
        }
        courseData.activities[dbClass.activity].push(classData);
    });
    return courseData;
};
