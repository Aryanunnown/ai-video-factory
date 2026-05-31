import { execa } from "execa";
import path from "path";
import fs from "fs/promises";
import prisma from "../lib/prisma";

const USE_CACHED_ASSETS = process.env.USE_CACHED_ASSETS === "true";

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
    const workspaceRoot = path.resolve(process.cwd(), "..");
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

  const workspaceRoot = path.resolve(process.cwd(), "..");
  const storageImagesDir = path.join(workspaceRoot, "storage", "images");
  const storageAudioDir = path.join(workspaceRoot, "storage", "audio");
  const remotionPublicDir = path.join(workspaceRoot, "remotion", "public");

  // Ensure remotion public directory exists
  await fs.mkdir(remotionPublicDir, { recursive: true });

  // Copy scene-specific assets to remotion public directory
  const scenes = videoJob.scenes
    .filter((scene) => scene.audioUrl && scene.imageUrl)
    .map((scene) => {
      const imageFilename = path.basename(scene.imageUrl!);
      const audioFilename = scene.audioUrl ? path.basename(scene.audioUrl!) : undefined;
      
      // Copy image to remotion public if it exists in storage
      if (scene.imageUrl) {
        const srcPath = path.join(storageImagesDir, imageFilename);
        const destPath = path.join(remotionPublicDir, imageFilename);
        fs.access(srcPath).then(() => {
          fs.copyFile(srcPath, destPath).catch(() => {});
        }).catch(() => {});
      }
      
      // Copy audio to remotion public if it exists in storage
      if (scene.audioUrl && audioFilename) {
        const srcPath = path.join(storageAudioDir, audioFilename);
        const destPath = path.join(remotionPublicDir, audioFilename);
        fs.access(srcPath).then(() => {
          fs.copyFile(srcPath, destPath).catch(() => {});
        }).catch(() => {});
      }

      return {
        imageUrl: imageFilename,
        audioUrl: audioFilename,
        text: scene.text,
        duration: scene.duration,
      };
    });

  if (scenes.length === 0) {
    throw new Error(`No scenes with media found for job: ${videoJobId}`);
  }

  const remotionDir = path.join(workspaceRoot, "remotion");
  const outputDir = path.join(workspaceRoot, "storage", "videos");
  const outputPath = path.join(outputDir, `${videoJobId}.mp4`);
  const propsPath = path.join(outputDir, `${videoJobId}-props.json`);

  await fs.mkdir(outputDir, { recursive: true });

  const inputProps = { scenes };
  await fs.writeFile(propsPath, JSON.stringify(inputProps), "utf-8");

  try {
    const { stdout, stderr } = await execa(
      "npx",
      ["remotion", "render", "src/index.tsx", "VideoShorts", 
       `--props=${propsPath}`, 
       `--output=${outputPath}`, 
       "--codec=h264"],
      { 
        cwd: remotionDir
      }
    );

    if (stderr) {
      console.error("Remotion render stderr:", stderr);
    }

    console.log("Remotion render output:", stdout);
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