import type { Scene, VideoJob } from "@prisma/client";
import { ApiError } from "../types/api";
import {
  CreateVideoJobInput,
  CreateVideoJobResponse,
  CreateVideoJobData,
  VideoJobSummaryData,
} from "../types/video";
import prisma from "../lib/prisma";

const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 300;

export const createVideoJob = async (
  input: CreateVideoJobInput
): Promise<CreateVideoJobResponse> => {
  const topic = input.topic?.trim();
  const notes = input.notes?.trim();

  if (!topic) {
    const error = new Error("Topic is required") as ApiError;
    error.statusCode = 400;
    throw error;
  }

  if (topic.length < MIN_TOPIC_LENGTH) {
    const error = new Error(
      `Topic must be at least ${MIN_TOPIC_LENGTH} characters long`
    ) as ApiError;
    error.statusCode = 400;
    throw error;
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    const error = new Error(
      `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer`
    ) as ApiError;
    error.statusCode = 400;
    throw error;
  }

  const videoJob = await prisma.videoJob.create({
    data: {
      topic,
      notes: notes || null,
      status: "PENDING",
    },
  });

  const responseData: CreateVideoJobData = {
    id: videoJob.id,
    topic: videoJob.topic,
    status: videoJob.status,
    createdAt: videoJob.createdAt.toISOString(),
  };

  return {
    success: true,
    data: responseData,
  };
};

export const getVideoJobs = async (): Promise<VideoJobSummaryData[]> => {
  const jobs = await prisma.videoJob.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      topic: true,
      status: true,
      createdAt: true,
    },
  });

  return jobs.map((job) => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
  }));
};

export const getVideoById = async (
  videoJobId: string,
): Promise<VideoJob & { scenes: Scene[] }> => {
  const videoJob = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
  });

  if (!videoJob) {
    const error = new Error(`VideoJob not found for id: ${videoJobId}`) as ApiError;
    error.statusCode = 404;
    throw error;
  }

  const scenes = await prisma.scene.findMany({
    where: { jobId: videoJobId },
    orderBy: {
      orderNo: "asc",
    },
  });

  return {
    ...videoJob,
    scenes,
  };
};
