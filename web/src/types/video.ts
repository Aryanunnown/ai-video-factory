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
}

export interface VideoSummary {
  id: string;
  topic: string;
  status: string;
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
