import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function generateAudio(text: string, sceneId: string, voice?: string): Promise<string> {
  const audioDir = path.join(process.cwd(), "storage", "audio");
  const fullOutputPath = path.join(audioDir, `${sceneId}.wav`);

  try {
    await fs.mkdir(audioDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create audio directory: ${err instanceof Error ? err.message : String(err)}`);
  }

  const scriptPath = path.resolve(process.cwd(), "..", "tts", "generate_audio.py");

  return new Promise((resolve, reject) => {
    const venvPython = path.resolve(process.cwd(), "..", "tts", "venv", "bin", "python");
    const args = [scriptPath, text, fullOutputPath];
    if (voice) {
      args.push(voice);
    }
    const child = spawn(venvPython, args);

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

export async function getAudioDuration(audioPath: string): Promise<number> {
  const fullPath = path.join(process.cwd(), audioPath);
  
  return new Promise((resolve, reject) => {
    const child = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      fullPath
    ]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to run ffprobe: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed for ${audioPath} with exit code ${code}: ${stderr}`));
      } else {
        const duration = parseFloat(stdout.trim());
        if (isNaN(duration)) {
          reject(new Error(`Could not parse duration from ffprobe output: ${stdout}`));
        } else {
          resolve(duration);
        }
      }
    });
  });
}