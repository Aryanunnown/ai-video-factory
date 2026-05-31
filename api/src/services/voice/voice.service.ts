import prisma from "../../lib/prisma";
import { generateAudio } from "./piper.service";
import { Scene } from "@prisma/client";
import { renderVideo } from "../../services/render.service";
import fs from "fs/promises";
import path from "path";

const USE_CACHED_ASSETS = process.env.USE_CACHED_ASSETS === "true";

export async function generateSceneAudio(sceneId: string): Promise<Scene> {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) {
    throw new Error(`Scene not found for id: ${sceneId}`);
  }

  // Check if we should use cached assets and if any audio files exist in storage
  if (USE_CACHED_ASSETS) {
    const audioDir = path.join(process.cwd(), "storage", "audio");
    try {
      const files = await fs.readdir(audioDir);
      const wavFiles = files.filter(f => f.endsWith('.wav'));
      
      if (wavFiles.length > 0) {
        // Use the first available audio and create file with scene ID name
        const workspaceRoot = path.resolve(process.cwd(), "..");
        const destPath = path.join(workspaceRoot, "storage", "audio", `${sceneId}.wav`);
        await fs.copyFile(
          path.join(audioDir, wavFiles[0]),
          destPath
        ).catch(() => {});
        
        const fallbackAudioPath = `storage/audio/${sceneId}.wav`;
        const updatedScene = await prisma.scene.update({
          where: { id: sceneId },
          data: { audioUrl: fallbackAudioPath, voiceStatus: "DONE" },
        });
        return updatedScene;
      }
    } catch (err) {
      // Directory doesn't exist or access error - proceed with generation
    }
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