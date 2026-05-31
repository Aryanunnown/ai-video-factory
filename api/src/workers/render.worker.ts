import { renderVideo } from "../services/render.service";

export const processRenderJob = async (jobId: string): Promise<string> => {
  const outputPath = await renderVideo(jobId);
  return outputPath;
};