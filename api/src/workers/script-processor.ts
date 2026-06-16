import { Worker, Job } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { logger } from "../utils/logger";
import { SCRIPT_QUEUE_NAME, type ScriptJobData, type ScriptJobResult } from "../queues/script.queue";
import { generateScript } from "../services/script.service";
import { addImageJob } from "../queues";
import prisma from "../lib/prisma";

/**
 * Script Queue Worker
 * Processes script generation jobs
 */
export function createScriptWorker() {
  const worker = new Worker<ScriptJobData, ScriptJobResult>(
    SCRIPT_QUEUE_NAME,
    async (job: Job<ScriptJobData, ScriptJobResult>) => {
      logger.info(`Processing script job: ${job.id}`);

      try {
        const { videoJobId } = job.data;

        logger.info(`Generating script for video ${videoJobId}`);

        // Use the existing service to generate script and persist scenes
        const result = await generateScript(videoJobId);

        logger.info(`Script generation finished for video ${videoJobId}. Enqueuing image jobs for ${result.scenes.length} scenes.`);

        // Enqueue image jobs for each created scene
        for (const scene of result.scenes) {
          try {
            await addImageJob({ videoId: videoJobId, sceneId: scene.id, description: scene.visual || "" });
            logger.info(`Enqueued image job for scene ${scene.id} (video ${videoJobId})`);
          } catch (enqueueErr) {
            logger.error(`Failed to enqueue image job for scene ${scene.id}:`, enqueueErr);
          }
        }

        return { status: "success", data: result };
      } catch (error) {
        logger.error(`Error processing script job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getRedisClient(),
    }
  );

  worker.on("completed", (job) => {
    logger.info(`Script job completed: ${job.id}`);
  });

  worker.on("failed", async (job, error) => {
    logger.error(`Script job failed: ${job?.id}`, error);
    if (job?.data.videoJobId) {
      await prisma.videoJob.update({
        where: { id: job.data.videoJobId },
        data: { status: "FAILED", errorMessage: error?.message || "Script generation failed" },
      });
    }
  });

  return worker;
}
