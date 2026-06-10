import { Worker, Job } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { logger } from "../utils/logger";
import { IMAGE_QUEUE_NAME, type ImageJobData, type ImageJobResult } from "../queues/image.queue";
import { generateSceneImage } from "../services/visual/comfy.service";
import { addVoiceJob } from "../queues";
import prisma from "../lib/prisma";

/**
 * Image Queue Worker
 * Processes image generation jobs
 */
export function createImageWorker() {
  const worker = new Worker<ImageJobData, ImageJobResult>(
    IMAGE_QUEUE_NAME,
    async (job: Job<ImageJobData, ImageJobResult>) => {
      logger.info(`Processing image job: ${job.id}`);

      try {
        const { projectId, videoId, sceneId, description } = job.data;

        logger.info(`Generating image for scene ${sceneId}: ${String(description).substring(0, 100)}...`);

        // Use visual service to generate and persist the image
        const imagePath = await generateSceneImage(sceneId);

        logger.info(`Image generated successfully for scene ${sceneId}: ${imagePath}`);

        // Fetch scene to obtain text for voice generation
        const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
        const text = scene?.text ?? "";

        // Enqueue voice job for this scene
        try {
          await addVoiceJob({ projectId: projectId as any, videoId, sceneId, text });
          logger.info(`Enqueued voice job for scene ${sceneId} (video ${videoId})`);
        } catch (enqueueErr) {
          logger.error(`Failed to enqueue voice job for scene ${sceneId}:`, enqueueErr);
        }

        return {
          status: "success",
          imagePath,
        };
      } catch (error) {
        logger.error(`Error processing image job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getRedisClient(),
    }
  );

  worker.on("completed", (job) => {
    logger.info(`Image job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Image job failed: ${job?.id}`, error);
  });

  return worker;
}
