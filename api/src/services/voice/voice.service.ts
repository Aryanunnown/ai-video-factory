import prisma from "../../lib/prisma";
import { generateAudio } from "./piper.service";
import { Scene } from "@prisma/client";

export async function generateSceneAudio(sceneId: string): Promise<Scene> {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) {
    throw new Error(`Scene not found for id: ${sceneId}`);
  }

  await prisma.scene.update({
    where: { id: sceneId },
    data: { voiceStatus: "PROCESSING" },
  });

  try {
    const text = scene.text || "";
    await generateAudio(text, sceneId);

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { audioUrl: `storage/audio/${sceneId}.wav`, voiceStatus: "DONE" },
    });

    return updatedScene;
  } catch (err) {
    await prisma.scene.update({
      where: { id: sceneId },
      data: { voiceStatus: "FAILED" },
    });
    throw err;
  }
}

export async function generateVideoAudio(videoJobId: string): Promise<{ sceneCount: number; generatedFiles: Scene[] }> {
  const job = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
    include: { scenes: { orderBy: { orderNo: "asc" } } },
  });

  if (!job) {
    throw new Error(`VideoJob not found for id: ${videoJobId}`);
  }

  const scenes = job.scenes ?? [];
  const generatedFiles: Scene[] = [];

  await prisma.videoJob.update({
    where: { id: videoJobId },
    data: { status: "VOICE_PROCESSING" },
  });

  try {
    for (const scene of scenes) {
      const sceneResult = await generateSceneAudio(scene.id);
      generatedFiles.push(sceneResult);
    }

    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "VOICE_DONE" },
    });

    return { sceneCount: scenes.length, generatedFiles };
  } catch (err) {
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}
