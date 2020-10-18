"use strict";
exports.__esModule = true;
exports.minDaysScore = void 0;
exports.minDaysScore = function (timetable) {
    var times = [];
    timetable.forEach(function (period) {
        if (!times.includes(period.time.day)) {
            times.push(period.time.day);
        }
    });
    return 11 - times.length;
};
