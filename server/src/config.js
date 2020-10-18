"use strict";
var _a;
exports.__esModule = true;
exports.config = exports.allConfig = exports.Env = void 0;
var Env;
(function (Env) {
    Env["DEV"] = "DEV";
    Env["STAGING"] = "STAGING";
    Env["PROD"] = "PROD";
})(Env = exports.Env || (exports.Env = {}));
exports.allConfig = (_a = {},
    _a[Env.DEV] = {
        // database: secret.dev,
        database: 'mongodb://localhost:27017/',
        scraper: 'mongodb://localhost:27017'
    },
    _a[Env.STAGING] = {
        database: 'mongodb://database.notangles-db:27017/',
        scraper: 'mongodb://localhost:27017'
    },
    _a[Env.PROD] = {
        database: 'mongodb://database.notangles-db:27017/',
        scraper: 'mongodb://database.notangles-db:27017'
    },
    _a);
exports.config = exports.allConfig[process.env.NODE_ENV || Env.DEV];
