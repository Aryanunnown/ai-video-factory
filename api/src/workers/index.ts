/**
 * Queue Workers Export
 * Central export point for all worker processors
 */

export { createScriptWorker } from "./script-processor";
export { createImageWorker } from "./image-processor";
export { createVoiceWorker } from "./voice-processor";
export { createRenderWorker } from "./queue-processors";

/**
 * Initialize all workers at once
 */
export function initializeAllWorkers() {
  const { createScriptWorker } = require("./script-processor");
  const { createImageWorker } = require("./image-processor");
  const { createVoiceWorker } = require("./voice-processor");
  const { createRenderWorker } = require("./queue-processors");

  const workers = [
    createScriptWorker(),
    createImageWorker(),
    createVoiceWorker(),
    createRenderWorker(),
  ];

  return workers;
}
