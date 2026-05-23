import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { exec as execCb } from "child_process";
import prisma from "../../lib/prisma";

const exec = promisify(execCb);

export async function generateSceneAudio(sceneId: string): Promise<string> {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) {
    throw new Error(`Scene not found for id: ${sceneId}`);
  }

  const audioDir = path.join(process.cwd(), "storage", "audio");
  await fs.mkdir(audioDir, { recursive: true });

  const aiffPath = path.join(audioDir, `${sceneId}.aiff`);
  const mp3Path = path.join(audioDir, `${sceneId}.mp3`);
  const relativeAudioUrl = `storage/audio/${sceneId}.mp3`;

  // mark processing
  await prisma.scene.update({
    where: { id: sceneId },
    data: { voiceStatus: "PROCESSING" },
  });

  try {
    // Use macOS `say` to synthesize to AIFF
    const text = scene.text || "";
    // limit text length to avoid excessively long TTS
    const clipped = text.length > 10000 ? text.slice(0, 10000) : text;

    // create AIFF
    const sayCmd = `say -o ${escapePath(aiffPath)} "${escapeShell(clipped)}"`;
    await exec(sayCmd);

    // try ffmpeg to convert to mp3
    const ffmpegCheck = await which("ffmpeg");
    if (ffmpegCheck) {
      const ffmpegCmd = `ffmpeg -y -i ${escapePath(aiffPath)} -acodec libmp3lame -ab 192k ${escapePath(mp3Path)}`;
      await exec(ffmpegCmd);
    } else {
      // fallback to afconvert (macOS) if available
      const afconvertCheck = await which("afconvert");
      if (afconvertCheck) {
        const afCmd = `afconvert -f MP3 -d I16@44100 ${escapePath(aiffPath)} ${escapePath(mp3Path)}`;
        await exec(afCmd);
      } else {
        throw new Error("No audio conversion tool found (ffmpeg or afconvert)");
      }
    }

    // remove intermediate AIFF if exists
    try {
      await fs.unlink(aiffPath);
    } catch (err) {
      // ignore
    }

    // update DB with audioUrl and DONE status
    await prisma.scene.update({
      where: { id: sceneId },
      data: { audioUrl: relativeAudioUrl, voiceStatus: "DONE" },
    });

    return relativeAudioUrl;
  } catch (err) {
    // mark failed
    await prisma.scene.update({
      where: { id: sceneId },
      data: { voiceStatus: "FAILED" },
    });
    throw err;
  }
}

export async function generateVideoAudio(videoJobId: string): Promise<{ sceneCount: number; generatedFiles: string[] }> {
  const job = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
    include: { scenes: { orderBy: { orderNo: "asc" } } },
  });

  if (!job) {
    throw new Error(`VideoJob not found for id: ${videoJobId}`);
  }

  const scenes = job.scenes ?? [];
  const generatedFiles: string[] = [];

  await prisma.videoJob.update({
    where: { id: videoJobId },
    data: { status: "VOICE_PROCESSING" },
  });

  try {
    for (const scene of scenes) {
      const audioUrl = await generateSceneAudio(scene.id);
      generatedFiles.push(audioUrl);
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

async function which(cmd: string): Promise<string | null> {
  try {
    const { stdout } = await exec(`which ${cmd}`);
    return stdout.trim() || null;
  } catch (err) {
    return null;
  }
}

function escapePath(p: string) {
  return `'${p.replace(/'/g, "'\\''")}'`;
}

function escapeShell(s: string) {
  return s.replace(/"/g, "\\\"");
}
