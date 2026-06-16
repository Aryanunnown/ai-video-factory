export interface CreateVideoRequest {
  topic: string;
  notes?: string;
  title?: string;
  scriptJson?: unknown;
}

export interface SceneResponse {
  id: string;
  jobId: string;
  orderNo: number;
  text: string;
  visual: string;
  duration: number;
  status: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  voiceStatus?: string | null;
  imageStatus?: string | null;
}

export interface VideoSummary {
  id: string;
  topic: string;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
}

export interface VideoJobsResponse {
  success: boolean;
  data: VideoSummary[];
}

export interface VideoResponse {
  id: string;
  topic: string;
  notes?: string | null;
  title?: string | null;
  status: string;
  errorMessage?: string | null;
  scriptJson?: unknown | null;
  audioUrl?: string | null;
  finalVideo?: string | null;
  createdAt: string;
  scenes?: SceneResponse[];
}

export interface VideoResponseAPI {
  success: boolean;
  data: VideoResponse;
}

export type CreateVideoPayload = CreateVideoRequest;

export type ProgressStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export interface JobProgress {
  script: ProgressStatus;
  image: ProgressStatus;
  voice: ProgressStatus;
  render: ProgressStatus;
}

export function deriveProgress(status: string): JobProgress {
  switch (status) {
    case "PENDING":
      return { script: "PROCESSING", image: "PENDING", voice: "PENDING", render: "PENDING" };
    case "SCRIPT_DONE":
      return { script: "DONE", image: "PROCESSING", voice: "PENDING", render: "PENDING" };
    case "IMAGE_DONE":
      return { script: "DONE", image: "DONE", voice: "PROCESSING", render: "PENDING" };
    case "VOICE_PROCESSING":
      return { script: "DONE", image: "DONE", voice: "PROCESSING", render: "PENDING" };
    case "VOICE_DONE":
      return { script: "DONE", image: "DONE", voice: "DONE", render: "PROCESSING" };
    case "RENDER_PROCESSING":
      return { script: "DONE", image: "DONE", voice: "DONE", render: "PROCESSING" };
    case "RENDER_DONE":
      return { script: "DONE", image: "DONE", voice: "DONE", render: "DONE" };
    case "FAILED":
      return { script: "FAILED", image: "FAILED", voice: "FAILED", render: "FAILED" };
    default:
      return { script: "PENDING", image: "PENDING", voice: "PENDING", render: "PENDING" };
  }
}
