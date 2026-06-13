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
        const { videoId, sceneId, description } = job.data;

        const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
        if (!scene) {
          throw new Error(`Scene not found for id: ${sceneId}`);
        }

        logger.info(`Generating image for scene ${sceneId} of video ${videoId}: ${String(description).substring(0, 100)}...`);

        // Use visual service to generate and persist the image
        const imagePath = await generateSceneImage(sceneId);

        logger.info(`Image generated successfully for scene ${sceneId}: ${imagePath}`);

        // Enqueue voice job for this scene
        const text = scene.text ?? "";
        try {
          await addVoiceJob({ videoId, sceneId, text });
          logger.info(`Enqueued voice job for scene ${sceneId} (video ${videoId})`);
        } catch (enqueueErr) {
          logger.error(`Failed to enqueue voice job for scene ${sceneId}:`, enqueueErr);
        }

        const pendingImages = await prisma.scene.count({
          where: {
            jobId: videoId,
            imageStatus: { not: "DONE" },
          },
        });

        if (pendingImages === 0) {
          await prisma.videoJob.update({
            where: { id: videoId },
            data: { status: "IMAGE_DONE" },
          });
          logger.info(`Video job ${videoId} updated to IMAGE_DONE`);
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
