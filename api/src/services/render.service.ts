import { execa } from "execa";
import path from "path";
import fs from "fs/promises";
import prisma from "../lib/prisma";

const USE_CACHED_ASSETS = process.env.USE_CACHED_ASSETS === "true";

interface RenderScene {
  imageUrl: string;
  audioUrl: string;
  text: string;
  duration: number;
}

export const renderVideo = async (videoJobId: string): Promise<string> => {
  const videoJob = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
    include: {
      scenes: {
        orderBy: { orderNo: "asc" },
      },
    },
  });

  if (!videoJob) {
    throw new Error(`VideoJob not found: ${videoJobId}`);
  }

  // Check if we should use cached video and if it exists in storage
  if (USE_CACHED_ASSETS) {
    const workspaceRoot = process.cwd();
    const videoPath = path.join(workspaceRoot, "storage", "videos", `${videoJobId}.mp4`);
    try {
      await fs.access(videoPath);
      const relativePath = `storage/videos/${videoJobId}.mp4`;
      await prisma.videoJob.update({
        where: { id: videoJobId },
        data: {
          finalVideo: relativePath,
          status: "RENDER_DONE",
        },
      });
      return relativePath;
    } catch (err) {
      // Video doesn't exist, proceed with rendering
    }
  }

  const workspaceRoot = process.cwd();
  const storageImagesDir = path.join(workspaceRoot, "storage", "images");
  const storageAudioDir = path.join(workspaceRoot, "storage", "audio");
  const remotionPublicDir = path.join(workspaceRoot, "..", "remotion", "public");

  await fs.mkdir(remotionPublicDir, { recursive: true });

  const renderScenes: RenderScene[] = [];

  for (const scene of videoJob.scenes) {
    if (!scene.audioUrl || !scene.imageUrl) continue;

    const baseImageFilename = path.basename(scene.imageUrl);
    const audioFilename = path.basename(scene.audioUrl);

    const srcImagePath = path.join(storageImagesDir, baseImageFilename);
    const destImagePath = path.join(remotionPublicDir, baseImageFilename);
    try {
      await fs.access(srcImagePath);
      await fs.copyFile(srcImagePath, destImagePath);
    } catch {}

    const srcAudioPath = path.join(storageAudioDir, audioFilename);
    const destAudioPath = path.join(remotionPublicDir, audioFilename);
    try {
      await fs.access(srcAudioPath);
      await fs.copyFile(srcAudioPath, destAudioPath);
    } catch {}

    const actualDuration = scene.duration || 8;

    renderScenes.push({
      imageUrl: baseImageFilename,
      audioUrl: audioFilename,
      text: scene.text || "",
      duration: actualDuration,
    });
  }

  if (renderScenes.length === 0) {
    throw new Error(`No scenes with media found for job: ${videoJobId}`);
  }

  // Copy background music if present
  let backgroundMusicUrl: string | undefined = undefined;
  const srcMusicPath = path.join(workspaceRoot, "storage", "music", "background.mp3");
  const destMusicPath = path.join(remotionPublicDir, "background.mp3");
  try {
    await fs.access(srcMusicPath);
    await fs.copyFile(srcMusicPath, destMusicPath);
    backgroundMusicUrl = "background.mp3";
    console.log("[Render] Found background music, copied to Remotion public directory");
  } catch (err) {
    console.log("[Render] No background music found in storage/music/background.mp3, rendering without it");
  }

  // Calculate total duration in frames
  const totalDurationFrames = renderScenes.reduce((total, scene) => total + Math.round(scene.duration * 30), 0);
  console.log(`[Render] Total scenes: ${renderScenes.length}, Total duration: ${totalDurationFrames} frames (${(totalDurationFrames / 30).toFixed(2)}s)`);
  console.log(`[Render] Scene details:`, renderScenes.map((s, i) => `Scene ${i + 1}: ${s.duration}s (${Math.round(s.duration * 30)} frames)`).join(", "));

  const remotionDir = path.join(workspaceRoot, "..", "remotion");
  const outputDir = path.join(workspaceRoot, "storage", "videos");
  const outputPath = path.join(outputDir, `${videoJobId}.mp4`);
  const propsPath = path.join(outputDir, `${videoJobId}-props.json`);

  await fs.mkdir(outputDir, { recursive: true });

  const inputProps = { scenes: renderScenes, backgroundMusicUrl };
  await fs.writeFile(propsPath, JSON.stringify(inputProps), "utf-8");

  try {
    const { stdout, stderr } = await execa(
      "npx",
      ["remotion", "render", "src/index.tsx", "VideoShorts",
       `--props=${propsPath}`,
       `--output=${outputPath}`,
       "--codec=h264"],
      {
        cwd: remotionDir,
         stdio: "inherit"
      }
    );

    if (stderr) {
      console.error("Remotion render stderr:", stderr);
    }

      console.log("Remotion render completed");
  } catch (error: any) {
    await fs.unlink(propsPath).catch(() => {});
    await prisma.videoJob.update({
      where: { id: videoJobId },
      data: { status: "FAILED" },
    });
    throw error;
  }

  const relativePath = `storage/videos/${videoJobId}.mp4`;

  await prisma.videoJob.update({
    where: { id: videoJobId },
    data: {
      finalVideo: relativePath,
      status: "RENDER_DONE",
    },
  });

  await fs.unlink(propsPath).catch(() => {});

  return relativePath;
};