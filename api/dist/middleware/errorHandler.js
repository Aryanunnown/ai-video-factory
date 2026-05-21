"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode ?? 500;
    const message = err.message ?? "Internal Server Error";
    logger_1.logger.error(message, { path: req.path, stack: err.stack });
    res.status(statusCode).json({
        status: "error",
        message,
    });
};
exports.errorHandler = errorHandler;
