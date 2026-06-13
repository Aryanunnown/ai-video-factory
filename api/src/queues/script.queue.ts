import { Queue } from "bullmq";
import { createQueue } from "./factory";
import { logger } from "../utils/logger";

export const SCRIPT_QUEUE_NAME = "SCRIPT_QUEUE";

export interface ScriptJobData {
  videoJobId: string;
}

export interface ScriptJobResult {
  status: "success" | "failed";
  data?: any;
  error?: string;
}

export let scriptQueue: Queue<ScriptJobData, ScriptJobResult> | null = null;

/**
 * Initialize the script queue
 */
export function initializeScriptQueue(): Queue<ScriptJobData, ScriptJobResult> {
  scriptQueue = createQueue<ScriptJobData>(SCRIPT_QUEUE_NAME);
  return scriptQueue;
}

/**
 * Get the script queue instance
 */
export function getScriptQueue(): Queue<ScriptJobData, ScriptJobResult> {
  if (!scriptQueue) {
    throw new Error("Script queue not initialized. Call initializeScriptQueue() first.");
  }
  return scriptQueue;
}

/**
 * Add a job to the script queue
 */
export async function addScriptJob(data: ScriptJobData) {
  const jobId = `script-${data.videoJobId}-${Date.now()}`;
  const queue = getScriptQueue();

  logger.info("Enqueuing script job", {
    queue: SCRIPT_QUEUE_NAME,
    jobId,
    videoJobId: data.videoJobId,
  });

  return queue.add(SCRIPT_QUEUE_NAME, data, {
    jobId,
  });
}
