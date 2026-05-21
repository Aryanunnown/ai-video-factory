import axios from "axios";
import { CreateVideoPayload, VideoResponse, VideoSummary, VideoJobsResponse } from "../types/video";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const createVideoJobApi = async (payload: CreateVideoPayload): Promise<VideoResponse> => {
  const response = await api.post<VideoResponse>("/video/create", payload);
  return response.data;
};

export const getVideoJobApi = async (id: string): Promise<VideoResponse> => {
  const response = await api.get<VideoResponse>(`/video/${id}`);
  return response.data;
};

export const getVideoJobsApi = async (): Promise<VideoSummary[]> => {
  const response = await api.get<VideoJobsResponse>("/video");

  console.log(
    "API response for video jobs:",
    response.data
  );

  return response.data.data;
};