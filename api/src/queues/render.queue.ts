import { Queue } from "bullmq";
import { createQueue } from "./factory";
import { logger } from "../utils/logger";

export const RENDER_QUEUE_NAME = "RENDER_QUEUE";

export interface RenderJobData {
  projectId: string;
  videoId: string;
  scenes: Array<{
    sceneId: string;
    imageUrl?: string;
    audioUrl?: string;
    duration?: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface RenderJobResult {
  status: "success" | "failed";
  videoPath?: string;
  duration?: number;
  error?: string;
}

export let renderQueue: Queue<RenderJobData, RenderJobResult> | null = null;

/**
 * Initialize the render queue
 */
export function initializeRenderQueue(): Queue<RenderJobData, RenderJobResult> {
  renderQueue = createQueue<RenderJobData>(RENDER_QUEUE_NAME);
  return renderQueue;
}

/**
 * Get the render queue instance
 */
export function getRenderQueue(): Queue<RenderJobData, RenderJobResult> {
  if (!renderQueue) {
    throw new Error("Render queue not initialized. Call initializeRenderQueue() first.");
  }
  return renderQueue;
}

/**
 * Add a job to the render queue
 */
export async function addRenderJob(data: RenderJobData) {
  const jobId = `render-${data.videoId}-${Date.now()}`;
  const queue = getRenderQueue();

  logger.info("Enqueuing render job", {
    queue: RENDER_QUEUE_NAME,
    jobId,
    videoId: data.videoId,
    sceneCount: data.scenes?.length,
  });

  return queue.add(RENDER_QUEUE_NAME, data, {
    jobId,
  });
}
