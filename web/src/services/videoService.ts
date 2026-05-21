import { createVideoJobApi } from "../api/videoApi";
import { CreateVideoPayload, VideoResponse } from "../types/video";

export const createVideo = async (payload: CreateVideoPayload): Promise<VideoResponse> => {
  return createVideoJobApi(payload);
};

export const fetchVideo = async (id: string): Promise<VideoResponse> => {
  throw new Error("fetchVideo is not implemented yet");
};
