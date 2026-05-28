import axios from "axios";

const COMFYUI_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export interface QueuePromptResponse {
  prompt_id: string;
}

export interface ImageInfo {
  filename: string;
  subfolder: string;
  type: string;
}

export interface HistoryEntry {
  status: {
    completed: boolean;
    failed: boolean;
  };
  outputs: Record<string, { images: ImageInfo[] }>;
}

export async function queuePrompt(
  workflow: Record<string, unknown>
): Promise<QueuePromptResponse> {
  const response = await axios.post<QueuePromptResponse>(`${COMFYUI_URL}/prompt`, {
    prompt: workflow,
  });
  return response.data;
}

export async function getHistory(promptId: string): Promise<Record<string, HistoryEntry>> {
  const response = await axios.get<Record<string, HistoryEntry>>(`${COMFYUI_URL}/history/${promptId}`);
  return response.data;
}

export async function downloadImage(filename: string, subfolder?: string, type?: string): Promise<Buffer> {
  let url = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}`;
  if (subfolder) {
    url += `&subfolder=${encodeURIComponent(subfolder)}`;
  }
  if (type) {
    url += `&type=${encodeURIComponent(type)}`;
  }
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}