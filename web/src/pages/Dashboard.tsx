import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getVideoJobsApi } from "../api/videoApi";
import { VideoSummary } from "../types/video";
import StatusChip from "../components/StatusChip";

const Dashboard = () => {
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ["videoJobs"],
    queryFn: getVideoJobsApi,
    // refetchInterval: 5000,
  });

  const totals = useMemo(
    () => ({
      total: jobs?.length ?? 0,
      pending: jobs?.filter((job) => job.status === "PENDING").length ?? 0,
      scriptDone: jobs?.filter((job) => job.status === "SCRIPT_DONE").length ?? 0,
      failed: jobs?.filter((job) => job.status === "FAILED").length ?? 0,
    }),
    [jobs]
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
        <Card sx={{ minHeight: 140 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Videos
            </Typography>
            <Typography variant="h3">{totals.total}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 140 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h3">{totals.pending}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 140 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Script Done
            </Typography>
            <Typography variant="h3">{totals.scriptDone}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 140 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Failed
            </Typography>
            <Typography variant="h3">{totals.failed}</Typography>
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
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.topic}</TableCell>
                      <TableCell>
                        <StatusChip status={job.status} />
                      </TableCell>
                      <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
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
