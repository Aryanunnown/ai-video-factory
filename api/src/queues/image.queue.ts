import { Queue } from "bullmq";
import { createQueue } from "./factory";
import { logger } from "../utils/logger";

export const IMAGE_QUEUE_NAME = "IMAGE_QUEUE";

export interface ImageJobData {
  projectId?: string;
  videoId: string;
  sceneId: string;
  description: string;
  [key: string]: any;
}

export interface ImageJobResult {
  status: "success" | "failed";
  imagePath?: string;
  error?: string;
}

export let imageQueue: Queue<ImageJobData, ImageJobResult> | null = null;

/**
 * Initialize the image queue
 */
export function initializeImageQueue(): Queue<ImageJobData, ImageJobResult> {
  imageQueue = createQueue<ImageJobData>(IMAGE_QUEUE_NAME);
  return imageQueue;
}

/**
 * Get the image queue instance
 */
export function getImageQueue(): Queue<ImageJobData, ImageJobResult> {
  if (!imageQueue) {
    throw new Error("Image queue not initialized. Call initializeImageQueue() first.");
  }
  return imageQueue;
}

/**
 * Add a job to the image queue
 */
export async function addImageJob(data: ImageJobData) {
  const jobId = `image-${data.sceneId}-${Date.now()}`;
  const queue = getImageQueue();

  logger.info("Enqueuing image job", {
    queue: IMAGE_QUEUE_NAME,
    jobId,
    videoId: data.videoId,
    sceneId: data.sceneId,
    description: data.description?.substring(0, 150),
  });

  return queue.add(IMAGE_QUEUE_NAME, data, {
    jobId,
  });
}
