"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var _config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI,
    env: process.env.NODE_ENV,
};
exports.config = Object.freeze(_config);
