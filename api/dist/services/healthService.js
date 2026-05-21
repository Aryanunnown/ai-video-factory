"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = void 0;
const checkHealth = () => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
});
exports.checkHealth = checkHealth;
