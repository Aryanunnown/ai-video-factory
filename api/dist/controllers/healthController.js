"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const healthService_1 = require("../services/healthService");
const getHealth = (req, res) => {
    const result = (0, healthService_1.checkHealth)();
    res.status(200).json(result);
};
exports.getHealth = getHealth;
