import prisma from "../../lib/prisma";
import { generateAudio, getAudioDuration } from "./piper.service";
import { Scene } from "@prisma/client";
import { renderVideo } from "../../services/render.service";
import fs from "fs/promises";
import path from "path";

const USE_CACHED_ASSETS = process.env.USE_CACHED_ASSETS === "true";

export async function generateSceneAudio(sceneId: string, voice?: string): Promise<Scene> {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) {
    throw new Error(`Scene not found for id: ${sceneId}`);
  }

  // Check if we should use cached assets and if specific audio file exists in storage
  if (USE_CACHED_ASSETS) {
    const audioDir = path.join(process.cwd(), "storage", "audio");
    const specificAudioPath = path.join(audioDir, `${sceneId}.wav`);
    try {
      await fs.access(specificAudioPath);
      const fallbackAudioPath = `storage/audio/${sceneId}.wav`;
      const measuredDuration = await getAudioDuration(fallbackAudioPath);
      
      const updatedScene = await prisma.scene.update({
        where: { id: sceneId },
        data: { audioUrl: fallbackAudioPath, voiceStatus: "DONE", duration: Math.round(measuredDuration) },
      });
      return updatedScene;
    } catch (err) {
      // File doesn't exist, proceed with generation
    }
  }

  await prisma.scene.update({
    where: { id: sceneId },
    data: { voiceStatus: "PROCESSING" },
  });

  try {
    const text = scene.text || "";
    const audioUrl = await generateAudio(text, sceneId, voice);

    // Measure actual audio duration
    const measuredDuration = await getAudioDuration(audioUrl);

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { 
        audioUrl, 
        voiceStatus: "DONE", 
        duration: Math.round(measuredDuration),
      },
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

    setImmediate(async () => {
      try {
        await prisma.videoJob.update({
          where: { id: videoJobId },
          data: { status: "RENDER_PROCESSING" },
        });
        await renderVideo(videoJobId);
      } catch (renderError) {
        console.error(`Render failed for job ${videoJobId}:`, renderError);
        await prisma.videoJob.update({
          where: { id: videoJobId },
          data: { status: "FAILED" },
        });
      }
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