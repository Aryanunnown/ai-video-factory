import { InferenceClient } from "@huggingface/inference";
import fs from "fs/promises";
import path from "path";

const HF_TOKEN = process.env.HF_TOKEN;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateImage(prompt: string, sceneId: string): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error("HF_TOKEN environment variable is not set");
  }

  const client = new InferenceClient(HF_TOKEN);
  const outputPath = path.join("storage", "images", `${sceneId}.png`);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const blob = await client.textToImage({
        provider: "replicate",
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 576,
        },
      }, { outputType: "blob" });

      const arrayBuffer = await blob.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const fullPath = path.join(process.cwd(), outputPath);

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, imageBuffer);

      return outputPath;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to generate image after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}