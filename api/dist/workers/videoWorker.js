"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoJob = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const processVideoJob = async (jobId) => {
    const job = await prisma_1.default.videoJob.findUnique({ where: { id: jobId } });
    if (!job) {
        throw new Error(`Video job not found: ${jobId}`);
    }
    // TODO: add worker logic for processing video jobs
    console.log(`Processing job ${jobId} with status ${job.status}`);
};
exports.processVideoJob = processVideoJob;
