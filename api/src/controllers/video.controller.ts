import { Request, Response, NextFunction } from "express";
import { createVideoJob, getVideoById, getVideoJobs } from "../services/video.service";
import { generateScript } from "../services/script.service";
import { generateVideoImages } from "../services/visual.service";
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

    setImmediate(async () => {
      try {
        await generateScript(created.data.id);
        await generateVideoImages(created.data.id);
      } catch (backgroundError) {
        console.error(
          `Background script/image generation failed for job ${created.data.id}:`,
          backgroundError,
        );
      }
    });

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
