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
var mongodb_1 = require("mongodb");
var config_1 = require("./config");
var url = config_1.config.database;
var Database = /** @class */ (function () {
    function Database() {
        var _this = this;
        /**
         * Connect to the notangles database
         * This should only be called by other functions in this file
         */
        this.connect = function () { return __awaiter(_this, void 0, void 0, function () {
            var client, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = new mongodb_1.MongoClient(url, { useNewUrlParser: true });
                        _a = this;
                        return [4 /*yield*/, client.connect()];
                    case 1:
                        _a.client = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * Disconnect from the notangles database
         */
        this.disconnect = function () {
            if (_this.client) {
                _this.client.close();
            }
        };
        /**
         * Select a database to get more information for
         * This should only be called by other functions in this file
         *
         * @param {string} dbName The desired year to search for courses in
         * @returns {Promise<Db>} a mongodb database
         */
        this.getDb = function (dbName) { return __awaiter(_this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.client) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        db = this.client.db(dbName);
                        return [2 /*return*/, db];
                }
            });
        }); };
        /**
         * Select the collection
         * This should only be called by other functions in this file
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @returns a mongodb collection
         */
        this.getCollection = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName;
            return __awaiter(_this, void 0, void 0, function () {
                var db;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getDb(dbName)];
                        case 1:
                            db = _b.sent();
                            return [2 /*return*/, db.collection(termColName)];
                    }
                });
            });
        };
        /**
         * Add courses to a collection
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @param doc A javascript object that contains course data
         */
        this.dbAdd = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName, doc = _a.doc;
            return __awaiter(_this, void 0, void 0, function () {
                var col;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getCollection({ dbName: dbName, termColName: termColName })];
                        case 1:
                            col = _b.sent();
                            return [4 /*yield*/, col.insertOne(doc)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get information about a course running in a specific year and term
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @param {string} courseCode The code of the desired course
         * @returns A javascript object containing information about the course. The object will be empty if the course cannot be found
         */
        this.dbRead = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName, courseCode = _a.courseCode;
            return __awaiter(_this, void 0, void 0, function () {
                var col, doc;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getCollection({ dbName: dbName, termColName: termColName })];
                        case 1:
                            col = _b.sent();
                            return [4 /*yield*/, col.findOne({ courseCode: courseCode })];
                        case 2:
                            doc = _b.sent();
                            return [2 /*return*/, doc];
                    }
                });
            });
        };
        /**
         * Change the information in a specific course
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @param {string} courseCode The code of the desired course
         * @param doc A javascript object containing the updates to the desired course
         */
        this.dbUpdate = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName, courseCode = _a.courseCode, doc = _a.doc;
            return __awaiter(_this, void 0, void 0, function () {
                var col, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getCollection({ dbName: dbName, termColName: termColName })];
                        case 1:
                            col = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, col.updateOne({ courseCode: courseCode }, { $set: doc })];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _b.sent();
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Remove a course from the database
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @param {string} courseCode The code of the desired course
         */
        this.dbDel = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName, courseCode = _a.courseCode;
            return __awaiter(_this, void 0, void 0, function () {
                var col;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getCollection({ dbName: dbName, termColName: termColName })];
                        case 1:
                            col = _b.sent();
                            return [4 /*yield*/, col.deleteOne({ courseCode: courseCode })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Fetch all the courses in a given term
         *
         * @param {string} dbName The desired year to search for courses in
         * @param {string} termColName The desired term to search for couses in
         * @returns an array containing all the courses in a specific term
         */
        this.dbFetchAll = function (_a) {
            var dbName = _a.dbName, termColName = _a.termColName;
            return __awaiter(_this, void 0, void 0, function () {
                var col, fields, hash;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getCollection({ dbName: dbName, termColName: termColName })];
                        case 1:
                            col = _b.sent();
                            fields = {
                                courseCode: true,
                                name: true
                            };
                            return [4 /*yield*/, col.find(undefined, {
                                    projection: fields
                                })];
                        case 2:
                            hash = _b.sent();
                            return [2 /*return*/, hash.toArray()];
                    }
                });
            });
        };
    }
    return Database;
}());
var db = new Database();
exports["default"] = db;
