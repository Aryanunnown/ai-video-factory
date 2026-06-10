import { Request, Response, NextFunction } from "express";
import { createVideoJob, getVideoById, getVideoJobs } from "../services/video.service";
import { logger } from "../utils/logger";
import { addScriptJob } from "../queues";
import { generateScript } from "../services/script.service";
import {
  CreateVideoJobInput,
  CreateVideoJobResponse,
  GetVideoJobResponse,
  ListVideoJobsResponse,
} from "../types/video";

export const handleCreateVideoJob = async (
  req: Request<{}, {}, CreateVideoJobInput>,
  res: Response<CreateVideoJobResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const created = await createVideoJob(req.body);

    logger.info(`Video job created: ${created.data.id}`);

    // Enqueue a script generation job instead of running inline
    try {
      await addScriptJob({ projectId: null as any, videoId: created.data.id, prompt: created.data.topic });
      logger.info(`Enqueued script job for video ${created.data.id}`);
    } catch (err) {
      logger.error(`Failed to enqueue script job for video ${created.data.id}:`, err);
    }

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const handleGetVideoJob = async (
  req: Request<{ id: string }>,
  res: Response<GetVideoJobResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await getVideoById(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        id: job.id,
        topic: job.topic,
        title: job.title,
        status: job.status,
        scriptJson: job.scriptJson,
        finalVideo: job.finalVideo,
        createdAt: job.createdAt.toISOString(),
        scenes: job.scenes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetVideoJobs = async (
  _req: Request,
  res: Response<ListVideoJobsResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobs = await getVideoJobs();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};