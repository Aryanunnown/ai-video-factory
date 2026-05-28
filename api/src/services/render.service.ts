import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs/promises";

export interface SceneForRender {
  imageUrl: string;
  audioUrl: string;
  text: string;
  duration: number;
}

export const renderVideo = async (
  scenes: SceneForRender[],
  jobId: string
): Promise<string> => {
  const remotionDir = path.join(process.cwd(), "..", "remotion");

  const bundled = await bundle({
    entryPoint: path.join(remotionDir, "src", "index.tsx"),
    onProgress: ({ progress }) => {
      console.log(`Bundle progress: ${Math.round(progress * 100)}%`);
    },
  });

  const composition = await selectComposition(bundled, {
    compositionId: "VideoShorts",
  });

  if (!composition) {
    throw new Error("Composition not found: VideoShorts");
  }

  const buildDir = path.join(remotionDir, "build");
  const outputPath = path.join(
    process.cwd(),
    "..",
    "storage",
    "videos",
    `${jobId}.mp4`
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: scenes.reduce((total, scene) => total + scene.duration * 30, 0),
      props: {
        scenes,
      },
    },
    serveUrl: buildDir,
    codec: "h264",
    outputLocation: outputPath,
    fps: 30,
    width: 1080,
    height: 1920,
  });

  const relativePath = `storage/videos/${jobId}.mp4`;
  return relativePath;
};