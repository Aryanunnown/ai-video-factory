import { Worker, Job } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { logger } from "../utils/logger";
import { VOICE_QUEUE_NAME, type VoiceJobData, type VoiceJobResult } from "../queues/voice.queue";
import { generateSceneAudio } from "../services/voice/voice.service";
import prisma from "../lib/prisma";
import { addRenderJob } from "../queues";

/**
 * Voice Queue Worker
 * Processes voice/audio generation jobs
 */
export function createVoiceWorker() {
  const worker = new Worker<VoiceJobData, VoiceJobResult>(
    VOICE_QUEUE_NAME,
    async (job: Job<VoiceJobData, VoiceJobResult>) => {
      logger.info(`Processing voice job: ${job.id}`);

      try {
        const { videoId, sceneId, voice } = job.data;

        const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
        if (!scene) {
          throw new Error(`Scene not found for id: ${sceneId}`);
        }

        logger.info(`Generating audio for scene ${sceneId} of video ${videoId} with voice ${voice ?? "default"}`);

        // Use voice service to generate audio and persist scene updates
        const updatedScene = await generateSceneAudio(sceneId, voice);

        logger.info(`Audio generated for scene ${sceneId}: ${updatedScene.audioUrl} (duration: ${updatedScene.duration}s)`);

        // Check if all scenes for this video have voiceStatus = DONE
        const pending = await prisma.scene.count({ where: { jobId: videoId, voiceStatus: { not: "DONE" } } });

        if (pending === 0) {
          // Gather scenes for render job
          const scenes = await prisma.scene.findMany({ where: { jobId: videoId }, orderBy: { orderNo: "asc" } });
          const renderScenes = scenes.map((s) => ({
            sceneId: s.id,
            imageUrl: s.imageUrl ?? "",
            audioUrl: s.audioUrl ?? "",
            duration: s.duration ?? 8,
            text: s.text ?? "",
          }));

          await prisma.videoJob.update({
            where: { id: videoId },
            data: { status: "VOICE_DONE" },
          });
          logger.info(`Video job ${videoId} updated to VOICE_DONE`);

          try {
            await addRenderJob({ videoId, scenes: renderScenes });
            logger.info(`Enqueued render job for video ${videoId}`);
          } catch (enqueueErr) {
            logger.error(`Failed to enqueue render job for video ${videoId}:`, enqueueErr);
          }
        }

        return {
          status: "success",
          audioPath: updatedScene.audioUrl ?? undefined,
          duration: updatedScene.duration ?? undefined,
        };
      } catch (error) {
        logger.error(`Error processing voice job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getRedisClient(),
    }
  );

  worker.on("completed", (job) => {
    logger.info(`Voice job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Voice job failed: ${job?.id}`, error);
  });

  return worker;
}
