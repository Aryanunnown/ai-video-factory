import {
  createQueue,
  SCRIPT_QUEUE_NAME,
  IMAGE_QUEUE_NAME,
  VOICE_QUEUE_NAME,
  RENDER_QUEUE_NAME,
} from "../queues";
import { logger } from "../utils/logger";

export interface JobPayload {
  videoJobId: string;
}

export async function enqueueScriptGeneration(videoJobId: string) {
  const queue = createQueue<JobPayload>(SCRIPT_QUEUE_NAME);
  const payload: JobPayload = { videoJobId };
  const jobId = `script-${videoJobId}-${Date.now()}`;

  logger.info("Enqueuing script generation job", {
    queue: SCRIPT_QUEUE_NAME,
    jobId,
    videoJobId,
  });

  return queue.add(SCRIPT_QUEUE_NAME, payload, { jobId });
}

export async function enqueueImageGeneration(videoJobId: string) {
  const queue = createQueue<JobPayload>(IMAGE_QUEUE_NAME);
  const payload: JobPayload = { videoJobId };
  const jobId = `image-${videoJobId}-${Date.now()}`;

  logger.info("Enqueuing image generation job", {
    queue: IMAGE_QUEUE_NAME,
    jobId,
    videoJobId,
  });

  return queue.add(IMAGE_QUEUE_NAME, payload, { jobId });
}

export async function enqueueVoiceGeneration(videoJobId: string) {
  const queue = createQueue<JobPayload>(VOICE_QUEUE_NAME);
  const payload: JobPayload = { videoJobId };
  const jobId = `voice-${videoJobId}-${Date.now()}`;

  logger.info("Enqueuing voice generation job", {
    queue: VOICE_QUEUE_NAME,
    jobId,
    videoJobId,
  });

  return queue.add(VOICE_QUEUE_NAME, payload, { jobId });
}

export async function enqueueRenderGeneration(videoJobId: string) {
  const queue = createQueue<JobPayload>(RENDER_QUEUE_NAME);
  const payload: JobPayload = { videoJobId };
  const jobId = `render-${videoJobId}-${Date.now()}`;

  logger.info("Enqueuing render generation job", {
    queue: RENDER_QUEUE_NAME,
    jobId,
    videoJobId,
  });

  return queue.add(RENDER_QUEUE_NAME, payload, { jobId });
}
