import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { getVideoJobApi } from "../api/videoApi";
import { VideoResponse } from "../types/video";

const statusToLabel = (status: string) => {
  switch (status) {
    case "DONE":
      return "Done";
    case "PROCESSING":
      return "Processing";
    case "FAILED":
      return "Failed";
    default:
      return "Pending";
  }
};

const statusToColor = (status: string) => {
  switch (status) {
    case "DONE":
      return "success";
    case "PROCESSING":
      return "info";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
};

const voiceStatusToColor = (status: string) => {
  switch (status) {
    case "DONE":
      return "success";
    case "PROCESSING":
      return "info";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
};

const getPipelineStatuses = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return ["DONE", "PROCESSING", "PENDING", "PENDING"];
    case "DONE":
      return ["DONE", "DONE", "DONE", "DONE"];
    case "FAILED":
      return ["FAILED", "FAILED", "FAILED", "FAILED"];
    default:
      return ["PENDING", "PENDING", "PENDING", "PENDING"];
  }
};

const steps = ["Script", "Voice", "Visual", "Render"];

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: video, isLoading, isError, error } = useQuery<VideoResponse, Error>({
    queryKey: ["video", id],
    queryFn: () => getVideoJobApi(id as string),
    enabled: Boolean(id),
    // refetchInterval: 3000,
    // refetchIntervalInBackground: true,
  });

  const pipelineStatuses = useMemo(
    () => getPipelineStatuses(video?.status ?? "PENDING"),
    [video?.status]
  );

  return (
    <Stack spacing={4} sx={{ width: "100%", maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
      <Card>
        <CardHeader title="Job Info" />
        <Divider />
        <CardContent>
          {isLoading ? (
            <Typography>Loading job info…</Typography>
          ) : isError ? (
            <Alert severity="error">{error?.message || "Unable to load video details."}</Alert>
          ) : video ? (
            <Stack spacing={2}>
              <Typography variant="h6">Topic</Typography>
              <Typography>{video.topic}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                <Chip
                  label={statusToLabel(video.status)}
                  color={statusToColor(video.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(video.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography>No video details available.</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pipeline" />
        <Divider />
        <CardContent>
          {isLoading ? (
            <Typography>Loading pipeline status…</Typography>
          ) : isError ? (
            <Alert severity="error">{error?.message || "Unable to load pipeline status."}</Alert>
          ) : (
            <Stack spacing={2}>
              {steps.map((step, index) => {
                const stepStatus = pipelineStatuses[index];
                return (
                  <Box key={step} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1">{step}</Typography>
                    <Chip
                      label={statusToLabel(stepStatus)}
                      color={statusToColor(stepStatus)}
                      size="small"
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Generated Scenes" />
        <Divider />
        <CardContent>
          {isLoading ? (
            <Typography>Loading generated scenes…</Typography>
          ) : isError ? (
            <Alert severity="error">{error?.message || "Unable to load generated scenes."}</Alert>
          ) : video?.scenes?.length ? (
            <Stack spacing={2}>
              {video.scenes.map((scene) => (
                <Accordion key={scene.id} disableGutters>
                  <AccordionSummary expandIcon={<Typography variant="body2">▼</Typography>}>
                    <Typography variant="subtitle1">Scene {scene.orderNo}</Typography>
                    <Box sx={{ ml: "auto", mr: 2 }}>
                      <Chip
                        label={statusToLabel(scene.voiceStatus || "PENDING")}
                        color={voiceStatusToColor(scene.voiceStatus || "PENDING")}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {scene.imageUrl && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                            Image Preview:
                          </Typography>
                          <img src={scene.imageUrl} alt={`Scene ${scene.orderNo}`} style={{ maxWidth: "100%", borderRadius: 4 }} />
                        </Box>
                      )}

                      {scene.audioUrl && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                            Audio Player:
                          </Typography>
                          <audio controls src={scene.audioUrl} style={{ width: "100%" }} />
                        </Box>
                      )}

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                          Voice Status:
                        </Typography>
                        <Chip
                          label={statusToLabel(scene.voiceStatus || "PENDING")}
                          color={voiceStatusToColor(scene.voiceStatus || "PENDING")}
                          size="small"
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                          Voice:
                        </Typography>
                        <Typography>{scene.text}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                          Visual:
                        </Typography>
                        <Typography>{scene.visual}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        <Box sx={{ minWidth: 160 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} gutterBottom>
                            Duration:
                          </Typography>
                          <Typography>{scene.duration} sec</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            <Typography>No scenes are available yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default VideoDetail;
