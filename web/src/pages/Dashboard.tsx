import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getVideoJobsApi } from "../api/videoApi";
import type { ProgressStatus } from "../types/video";
import { deriveProgress } from "../types/video";
import JobProgressStepper from "../components/JobProgressStepper";

const statusMap: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  PENDING: "default",
  PROCESSING: "info",
  DONE: "success",
  FAILED: "error",
};

const progressLabel: Record<ProgressStatus, string> = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  DONE: "DONE",
  FAILED: "FAILED",
};

interface CategoryCounts {
  PENDING: number;
  PROCESSING: number;
  DONE: number;
  FAILED: number;
}

function emptyCounts(): CategoryCounts {
  return { PENDING: 0, PROCESSING: 0, DONE: 0, FAILED: 0 };
}

const Dashboard = () => {
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ["videoJobs"],
    queryFn: getVideoJobsApi,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const categories = useMemo(() => {
    const script = emptyCounts();
    const image = emptyCounts();
    const voice = emptyCounts();
    const render = emptyCounts();

    jobs?.forEach((job) => {
      const p = deriveProgress(job.status);
      script[p.script]++;
      image[p.image]++;
      voice[p.voice]++;
      render[p.render]++;
    });

    return { script, image, voice, render };
  }, [jobs]);

  const progressChips = (counts: CategoryCounts) => (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
      {(Object.entries(counts) as [ProgressStatus, number][]).map(([status, count]) => (
        <Chip
          key={status}
          label={`${progressLabel[status]}: ${count}`}
          size="small"
          variant="outlined"
          color={statusMap[status]}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Script Progress
            </Typography>
            {progressChips(categories.script)}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Image Progress
            </Typography>
            {progressChips(categories.image)}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Voice Progress
            </Typography>
            {progressChips(categories.voice)}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Render Progress
            </Typography>
            {progressChips(categories.render)}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Latest Jobs
          </Typography>

          {isLoading ? (
            <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Typography color="error">
              {error?.message || "Unable to load video jobs."}
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Topic</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs?.map((job) => {
                    const progress = deriveProgress(job.status);
                    return (
                      <TableRow
                        key={job.id}
                        component={Link}
                        to={`/video/${job.id}`}
                        sx={{
                          textDecoration: "none",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <TableCell>
                          {job.topic}
                          {job.status === "FAILED" && job.errorMessage && (
                            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                              {job.errorMessage}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ minWidth: 360 }}>
                          <JobProgressStepper progress={progress} />
                        </TableCell>
                        <TableCell>
                          {new Date(job.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
