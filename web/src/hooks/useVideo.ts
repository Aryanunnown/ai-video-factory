import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createVideo } from "../services/videoService";
import { CreateVideoPayload, VideoResponse } from "../types/video";

export const useCreateVideo = (): UseMutationResult<VideoResponse, Error, CreateVideoPayload> => {
  return useMutation({
    mutationFn: createVideo,
  });
};
