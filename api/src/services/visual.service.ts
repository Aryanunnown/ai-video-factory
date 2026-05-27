import prisma from "../lib/prisma";
import { generateImage } from "./flux.service";
import { generateVideoAudio } from "./voice/voice.service";

export const generateVideoImages = async (videoJobId: string): Promise<void> => {
  await prisma.videoJob.update({
    where: { id: videoJobId },
    data: { status: "VISUAL_PROCESSING" },
  });

  try {
    const videoJob = await prisma.videoJob.findUnique({
      where: { id: videoJobId },
      include: { scenes: { orderBy: { orderNo: "asc" } } },
    });

    if (!videoJob) {
      throw new Error(`VideoJob not found for id: ${videoJobId}`);
    }

    const scenes = videoJob.scenes ?? [];

    for (const scene of scenes) {
      await prisma.scene.update({
        where: { id: scene.id },
        data: { imageStatus: "PROCESSING" },
      });

      try {
        const imagePath = await generateImage(scene.visual, scene.id);

        await prisma.scene.update({
          where: { id: scene.id },
          data: {
            imageUrl: imagePath,
            imageStatus: "DONE",
          },
        });
      } catch (error) {
        await prisma.scene.update({
          where: { id: scene.id },
          data: { imageStatus: "FAILED" },
        });

        await prisma.videoJob.update({
          where: { id: videoJobId },
          data: { status: "FAILED" },
        });
        throw error;
      }
    }

    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "VISUAL_DONE" },
    });

    // Start voice generation asynchronously
    setImmediate(async () => {
      try {
        await generateVideoAudio(videoJobId);
      } catch (voiceError) {
        console.error(`Voice generation failed for job ${videoJobId}:`, voiceError);
      }
    });
  } catch (error) {
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "FAILED" },
    });
    throw error;
  }
};