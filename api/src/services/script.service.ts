import type { Prisma, Scene, VideoJob } from "@prisma/client";
import prisma from "../lib/prisma";
import { MockProvider } from "./ai/mock.provider";

export interface ScriptGenerationResult {
  job: VideoJob;
  scenes: Scene[];
}

const aiProvider = new MockProvider();

export const generateScript = async (
  videoJobId: string,
): Promise<ScriptGenerationResult> => {
  const videoJob = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
  });

  if (!videoJob) {
    throw new Error(`VideoJob not found for id: ${videoJobId}`);
  }

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

  return result;
};
