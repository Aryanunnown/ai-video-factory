import { spawn } from "child_process";
import path from "path";

export function generateAudio(text: string, sceneId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = path.join("storage", "audio", `${sceneId}.wav`);
    const scriptPath = path.resolve(process.cwd(), "../../../tts/generate_audio.py");

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
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(outputPath);
      }
    });
  });
}