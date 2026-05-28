import fs from "fs/promises";
import path from "path";
import prisma from "../../lib/prisma";
import { queuePrompt, getHistory, downloadImage } from "../../lib/comfy-client";
import { loadWorkflow, injectPrompt } from "./workflow.util";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 180;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateSceneImage(sceneId: string): Promise<string> {
  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) {
    throw new Error(`Scene not found for id: ${sceneId}`);
  }

  await prisma.scene.update({
    where: { id: sceneId },
    data: { imageStatus: "PROCESSING" },
  });

  const workflow = await loadWorkflow();
  const modifiedWorkflow = injectPrompt(workflow, scene.visual || "");

  try {
    const { prompt_id } = await queuePrompt(modifiedWorkflow);

    let attempts = 0;
    let outputFilename: string | null = null;
    let outputSubfolder = "";
    let outputType = "temp";

    while (attempts < MAX_POLL_ATTEMPTS) {
      await delay(POLL_INTERVAL_MS);
      attempts++;

      const history = await getHistory(prompt_id);

      if (history?.[prompt_id]?.status?.completed) {
        const outputs = history[prompt_id].outputs;
        for (const nodeId of Object.keys(outputs)) {
          const nodeOutput = outputs[nodeId];
          if (nodeOutput?.images?.length) {
            const img = nodeOutput.images[0];
            outputFilename = img.filename;
            outputSubfolder = img.subfolder || "";
            outputType = img.type || "output";
            break;
          }
        }
        if (outputFilename) {
          break;
        }
        throw new Error("No output images found in ComfyUI history");
      }

      if (history?.[prompt_id]?.status?.failed) {
        throw new Error("ComfyUI workflow execution failed");
      }
    }

    if (!outputFilename) {
      throw new Error(`ComfyUI did not complete within ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000} seconds`);
    }

    const imageBuffer = await downloadImage(outputFilename, outputSubfolder, outputType);

    const outputPath = path.join("storage", "images", `${sceneId}.png`);
    const fullPath = path.join(process.cwd(), outputPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, imageBuffer);

    const relativePath = `storage/images/${sceneId}.png`;
    await prisma.scene.update({
      where: { id: sceneId },
      data: { imageUrl: relativePath, imageStatus: "DONE" },
    });

    return relativePath;
  } catch (error) {
    await prisma.scene.update({
      where: { id: sceneId },
      data: { imageStatus: "FAILED" },
    });

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate image for scene ${sceneId}: ${message}`);
  }
}