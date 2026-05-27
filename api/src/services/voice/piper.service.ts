import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function generateAudio(text: string, sceneId: string): Promise<string> {
  const audioDir = path.join(process.cwd(), "storage", "audio");
  const outputPath = path.join(audioDir, `${sceneId}.wav`);

  try {
    await fs.mkdir(audioDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create audio directory: ${err instanceof Error ? err.message : String(err)}`);
  }

  const scriptPath = path.resolve(process.cwd(), "../../../tts/generate_audio.py");

  return new Promise((resolve, reject) => {
    const child = spawn("python", [scriptPath, text, outputPath]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start Python process for scene ${sceneId}: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Piper TTS failed for scene ${sceneId} with exit code ${code}: ${stderr || stdout}`));
      } else {
        resolve(`storage/audio/${sceneId}.wav`);
      }
    });
  });
}