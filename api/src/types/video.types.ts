export interface CreateVideoRequest {
  topic: string;
  title?: string;
  scriptJson?: unknown;
}

export interface SceneResponse {
  id: string;
  jobId: string;
  text: string;
  visual: string;
  duration: number;
}

export interface VideoResponse {
  id: string;
  topic: string;
  title?: string | null;
  status: string;
  scriptJson?: unknown | null;
  audioUrl?: string | null;
  finalVideo?: string | null;
  createdAt: string;
  scenes?: SceneResponse[];
}
