"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.autoTT = void 0;
var clash_1 = require("./clash");
var database_1 = require("../database");
var dbReadToSort = function (course) {
    var activities = [];
    course.classes.forEach(function (c) {
        if (!activities.includes(c.activity)) {
            activities.push(c.activity);
        }
    });
    var activityObjects = [];
    activities.forEach(function (activity) {
        var act = {
            code: course.courseCode,
            activity: activity,
            classes: []
        };
        activityObjects.push(act);
    });
    course.classes.forEach(function (c) {
        activityObjects.forEach(function (activityObject) { });
    });
};
var autoInit = function (courses) { return __awaiter(void 0, void 0, void 0, function () {
    var ttCourses, _i, _a, course, args, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                ttCourses = [];
                _i = 0, _a = courses['courses'];
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                course = _a[_i];
                args = {
                    dbName: courses['year'].toString(10),
                    termColName: courses['term'],
                    courseCode: courses['code']
                };
                _c = (_b = ttCourses).push;
                return [4 /*yield*/, database_1["default"].dbRead(args)];
            case 2:
                _c.apply(_b, [_d.sent()]);
                _d.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                console.log(ttCourses);
                return [2 /*return*/];
        }
    });
}); };
exports.autoTT = function (classes, calc) {
    var maxScore = -1;
    var index = 0;
    var bestTT = [];
    if (classes.length === 0) {
        return [];
    }
    classes.forEach(function (classSlot) {
        var tt = [];
        classSlot.periods.forEach(function (period) {
            tt.push(period);
        });
        tt = fillTT(index, tt, calc, classes);
        var score = calc(tt);
        if (score > maxScore) {
            bestTT = tt.slice(0);
            maxScore = score;
        }
    });
    return bestTT;
};
var fillTT = function (index, tt, calc, classes) {
    index += 1;
    if (index >= classes.length) {
        return tt;
    }
    var maxScore = -1;
    var bestTT = [];
    classes.forEach(function (classSlot) {
        var clashing = false;
        classSlot.periods.forEach(function (p1) {
            tt.forEach(function (p2) {
                if (clash_1.clash(p1.time, p2.time) === true) {
                    clashing = true;
                }
            });
        });
        if (clashing === false) {
            var newTT_1 = tt.slice(0);
            classSlot.periods.forEach(function (period) {
                newTT_1.push(period);
            });
            newTT_1 = fillTT(index, newTT_1, calc, classes);
            var score = calc(newTT_1);
            if (score > maxScore) {
                maxScore = score;
                bestTT = newTT_1;
            }
        }
    });
    return bestTT;
};
var request = {
    courses: [
        {
            code: 'MATH1131',
            exclude: ['Lecture']
        },
    ],
    year: 2020,
    term: 'T1',
    criteria: { daysAtUni: 10, napTime: 1 }
};
autoInit(request);
