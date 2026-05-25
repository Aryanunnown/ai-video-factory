import prisma from "../lib/prisma";
import { generateImage } from "./flux.service";

export const generateVideoImages = async (videoJobId: string): Promise<void> => {
  // Update job status to VISUAL_PROCESSING
  await prisma.videoJob.update({
    where: { id: videoJobId },
    data: { status: "VISUAL_PROCESSING" },
  });

  try {
    // Load scenes for the video job
    const videoJob = await prisma.videoJob.findUnique({
      where: { id: videoJobId },
      include: { scenes: { orderBy: { orderNo: "asc" } } },
    });

    if (!videoJob) {
      throw new Error(`VideoJob not found for id: ${videoJobId}`);
    }

    const scenes = videoJob.scenes ?? [];

    // Process each scene
    for (const scene of scenes) {
      // Mark scene as processing
      await prisma.scene.update({
        where: { id: scene.id },
        data: { imageStatus: "PROCESSING" },
      });

      try {
        // Generate image using the visual description as prompt
        const imagePath = await generateImage(scene.visual, scene.id);

        // Update scene with image URL and DONE status
        await prisma.scene.update({
          where: { id: scene.id },
          data: {
            imageUrl: imagePath,
            imageStatus: "DONE",
          },
        });
      } catch (error) {
        // Mark scene as failed
        await prisma.scene.update({
          where: { id: scene.id },
          data: { imageStatus: "FAILED" },
        });

        // Update job status to FAILED and re-throw
        await prisma.videoJob.update({
          where: { id: videoJobId },
          data: { status: "FAILED" },
        });
        throw error;
      }
    }

    // All scenes processed successfully, update job status to VISUAL_DONE
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "VISUAL_DONE" },
    });
  } catch (error) {
    // If any error occurs during the process, ensure job status is FAILED
    // (already set in the catch block above, but adding a safety net)
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "FAILED" },
    });
    throw error;
  }
};