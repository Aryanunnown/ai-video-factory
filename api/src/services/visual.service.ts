import prisma from "../lib/prisma";
import { generateSceneImage } from "./visual/comfy.service";
import { generateVideoAudio } from "./voice/voice.service";

export async function generateVideoImages(videoJobId: string): Promise<{ generatedCount: number }> {
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
    let generatedCount = 0;

    for (const scene of scenes) {
      try {
        const imagePath = await generateSceneImage(scene.id);

        await prisma.scene.update({
          where: { id: scene.id },
          data: {
            imageUrl: imagePath,
            imageStatus: "DONE",
          },
        });
        generatedCount++;
      } catch (error) {
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

    setImmediate(async () => {
      try {
        await generateVideoAudio(videoJobId);
      } catch (voiceError) {
        console.error(`Voice generation failed for job ${videoJobId}:`, voiceError);
      }
    });

    return { generatedCount };
  } catch (error) {
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}