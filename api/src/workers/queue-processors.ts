import { Worker, Job } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { logger } from "../utils/logger";
import { RENDER_QUEUE_NAME, type RenderJobData, type RenderJobResult } from "../queues/render.queue";
import { renderVideo } from "../services/render.service";
import prisma from "../lib/prisma";

/**
 * Render Queue Worker
 * Processes video rendering jobs
 */
export function createRenderWorker() {
  const worker = new Worker<RenderJobData, RenderJobResult>(
    RENDER_QUEUE_NAME,
    async (job: Job<RenderJobData, RenderJobResult>) => {
      logger.info(`Processing render job: ${job.id}`);

      try {
        const { videoId } = job.data;

        logger.info(`Rendering video ${videoId}`);

        // Call the existing render service which runs Remotion and updates DB
        const outputPath = await renderVideo(videoId);

        logger.info(`Render service completed for video ${videoId}: ${outputPath}`);

        return {
          status: "success",
          videoPath: outputPath,
        };
      } catch (error) {
        logger.error(`Error processing render job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getRedisClient(),
    }
  );

  worker.on("completed", (job) => {
    logger.info(`Render job completed: ${job.id}`);
  });

  worker.on("failed", async (job, error) => {
    logger.error(`Render job failed: ${job?.id}`, error);
    if (job?.data.videoId) {
      await prisma.videoJob.update({
        where: { id: job.data.videoId },
        data: { status: "FAILED", errorMessage: error?.message || "Render failed" },
      });
    }
  });

  return worker;
}
