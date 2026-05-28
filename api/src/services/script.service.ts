import type { Prisma, Scene, VideoJob } from "@prisma/client";
import prisma from "../lib/prisma";
import { getAIProvider } from "./ai/provider.factory";
import { generateVideoImages } from "./visual.service";

export interface ScriptGenerationResult {
  job: VideoJob;
  scenes: Scene[];
}

export const generateScript = async (
  videoJobId: string,
): Promise<ScriptGenerationResult> => {
  const videoJob = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
  });

  if (!videoJob) {
    throw new Error(`VideoJob not found for id: ${videoJobId}`);
  }

  const aiProvider = getAIProvider();
  const scriptOutput = await aiProvider.generateScript(videoJob.topic);

  const result = await prisma.$transaction(async (tx) => {
    const updatedJob = await tx.videoJob.update({
      where: { id: videoJobId },
      data: {
        title: scriptOutput.title,
        scriptJson: scriptOutput as unknown as Prisma.InputJsonValue,
        status: "SCRIPT_DONE",
      },
    });

    const scenes = await Promise.all(
      scriptOutput.scenes.map((scene) =>
        tx.scene.create({
          data: {
            jobId: videoJobId,
            orderNo: scene.orderNo,
            text: scene.text,
            visual: scene.visual,
            duration: scene.duration,
            status: "PENDING",
          },
        }),
      ),
    );

    return {
      job: updatedJob,
      scenes,
    };
  });

  // Start image generation asynchronously after SCRIPT_DONE
  setImmediate(async () => {
    try {
      await generateVideoImages(videoJobId);
    } catch (imageError) {
      console.error(`Image generation failed for job ${videoJobId}:`, imageError);
    }
  });

  return result;
};
