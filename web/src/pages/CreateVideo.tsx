import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createVideo } from "../services/videoService";
import { CreateVideoPayload } from "../types/video";

const CreateVideo = () => {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createVideo,
    onSuccess: (data) => {
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate(`/video/${data.id}`);
      }, 800);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Unable to create video job. Please try again.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setFormError("Video Topic is required.");
      return;
    }

    const payload: CreateVideoPayload = {
      topic: trimmedTopic,
      notes: notes.trim() || undefined,
    };

    mutation.mutate(payload);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 120px)",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 700, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Generate Your Video
              </Typography>
              <Typography color="text.secondary">
                Enter a topic and optional notes to create a new AI video workflow.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Video Topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  required
                  fullWidth
                  disabled={mutation.isPending}
                />

                <TextField
                  label="Notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Optional details for the video generation"
                  disabled={mutation.isPending}
                />

                {formError && <Alert severity="error">{formError}</Alert>}
                {mutation.isError && (
                  <Alert severity="error">
                    {(mutation.error as Error).message || "Unable to generate video. Please try again."}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Generating..." : "Generate Video"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Video job created successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateVideo;
