import axios from "axios";
import { CreateVideoPayload, VideoResponse, VideoSummary, VideoJobsResponse, VideoResponseAPI } from "../types/video";

const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const transformUrls = (data: VideoResponse): VideoResponse => {
  if (data.scenes) {
    data.scenes = data.scenes.map((scene) => ({
      ...scene,
      imageUrl: scene.imageUrl ? `${API_BASE_URL}/${scene.imageUrl}` : null,
      audioUrl: scene.audioUrl ? `${API_BASE_URL}/${scene.audioUrl}` : null,
    }));
  }
  return data;
};

export const createVideoJobApi = async (payload: CreateVideoPayload): Promise<VideoResponse> => {
  const response = await api.post<VideoResponseAPI>("/video/create", payload);
  return response.data.data;
};

export const getVideoJobApi = async (id: string): Promise<VideoResponse> => {
  const response = await api.get<VideoResponseAPI>(`/video/${id}`);
  console.log(`API response for video job ${id}:`, response);
  return transformUrls(response.data.data);
};

export const getVideoJobsApi = async (): Promise<VideoSummary[]> => {
  const response = await api.get<VideoJobsResponse>("/video");

  console.log(
    "API response for video jobs:",
    response.data
  );

  return response.data.data;
};