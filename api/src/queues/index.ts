/**
 * BullMQ Queue Exports
 * Central export point for all queue instances and utilities
 */

// Queue initialization functions
export {
  initializeScriptQueue,
  getScriptQueue,
  addScriptJob,
  SCRIPT_QUEUE_NAME,
  type ScriptJobData,
  type ScriptJobResult,
} from "./script.queue";

export {
  initializeImageQueue,
  getImageQueue,
  addImageJob,
  IMAGE_QUEUE_NAME,
  type ImageJobData,
  type ImageJobResult,
} from "./image.queue";

export {
  initializeVoiceQueue,
  getVoiceQueue,
  addVoiceJob,
  VOICE_QUEUE_NAME,
  type VoiceJobData,
  type VoiceJobResult,
} from "./voice.queue";

export {
  initializeRenderQueue,
  getRenderQueue,
  addRenderJob,
  RENDER_QUEUE_NAME,
  type RenderJobData,
  type RenderJobResult,
} from "./render.queue";

// Queue factory utilities
export {
  createQueue,
  getAllQueues,
  closeAllQueues,
  purgeQueue,
} from "./factory";

/**
 * Initialize all queues at once
 */
export function initializeAllQueues() {
  const { initializeScriptQueue } = require("./script.queue");
  const { initializeImageQueue } = require("./image.queue");
  const { initializeVoiceQueue } = require("./voice.queue");
  const { initializeRenderQueue } = require("./render.queue");

  initializeScriptQueue();
  initializeImageQueue();
  initializeVoiceQueue();
  initializeRenderQueue();
}
