import { Queue } from "bullmq";
import { createQueue } from "./factory";
import { logger } from "../utils/logger";

export const VOICE_QUEUE_NAME = "VOICE_QUEUE";

export interface VoiceJobData {
  projectId: string;
  videoId: string;
  sceneId: string;
  text: string;
  voice?: string;
  [key: string]: any;
}

export interface VoiceJobResult {
  status: "success" | "failed";
  audioPath?: string;
  duration?: number;
  error?: string;
}

export let voiceQueue: Queue<VoiceJobData, VoiceJobResult> | null = null;

/**
 * Initialize the voice queue
 */
export function initializeVoiceQueue(): Queue<VoiceJobData, VoiceJobResult> {
  voiceQueue = createQueue<VoiceJobData>(VOICE_QUEUE_NAME);
  return voiceQueue;
}

/**
 * Get the voice queue instance
 */
export function getVoiceQueue(): Queue<VoiceJobData, VoiceJobResult> {
  if (!voiceQueue) {
    throw new Error("Voice queue not initialized. Call initializeVoiceQueue() first.");
  }
  return voiceQueue;
}

/**
 * Add a job to the voice queue
 */
export async function addVoiceJob(data: VoiceJobData) {
  const jobId = `voice-${data.sceneId}-${Date.now()}`;
  const queue = getVoiceQueue();

  logger.info("Enqueuing voice job", {
    queue: VOICE_QUEUE_NAME,
    jobId,
    videoId: data.videoId,
    sceneId: data.sceneId,
    text: data.text?.substring(0, 150),
    voice: data.voice ?? "default",
  });

  return queue.add(VOICE_QUEUE_NAME, data, {
    jobId,
  });
}
