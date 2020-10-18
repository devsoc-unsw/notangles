"use strict";
exports.__esModule = true;
exports.clash = void 0;
exports.clash = function (time1, time2) {
    var clashing = false;
    if (time1.start >= time2.start && time1.start < time2.end) {
        clashing = true;
    }
    if (time1.end > time2.start && time1.end <= time2.end) {
        clashing = true;
    }
    if (time2.start >= time1.start && time2.start < time1.end) {
        clashing = true;
    }
    if (time2.end > time1.start && time2.end <= time1.end) {
        clashing = true;
    }
    if (time1.day != time2.day) {
        clashing = false;
    }
    return clashing;
};
