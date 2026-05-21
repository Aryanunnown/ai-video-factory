import type { Scene, VideoJob } from "@prisma/client";

export interface CreateVideoJobInput {
  topic: string;
  notes?: string;
}

export interface CreateVideoJobData {
  id: string;
  topic: string;
  status: string;
  createdAt: string;
}

export interface CreateVideoJobResponse {
  success: true;
  data: CreateVideoJobData;
}

export interface VideoJobSummaryData {
  id: string;
  topic: string;
  status: string;
  createdAt: string;
}

export interface ListVideoJobsResponse {
  success: true;
  data: VideoJobSummaryData[];
}

export interface VideoJobDetailData
  extends Pick<VideoJob, "id" | "topic" | "title" | "status" | "scriptJson"> {
  createdAt: string;
  scenes: Scene[];
}

export interface GetVideoJobResponse {
  success: true;
  data: VideoJobDetailData;
}

export interface VideoJobResponse extends VideoJob {}

export type VideoJobRecord = VideoJob;
