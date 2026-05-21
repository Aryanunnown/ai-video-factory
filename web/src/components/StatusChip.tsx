import { Chip } from "@mui/material";

const statusColorMap: Record<string, "default" | "primary" | "success" | "info" | "warning" | "error"> = {
  PENDING: "default",
  PROCESSING: "info",
  SCRIPT_DONE: "success",
  VOICE_DONE: "primary",
  RENDER_DONE: "warning",
  FAILED: "error",
};

interface StatusChipProps {
  status: string;
}

const StatusChip = ({ status }: StatusChipProps) => {
  const color = statusColorMap[status] ?? "default";

  return <Chip label={status.replace(/_/g, " ")} color={color} size="small" />;
};

export default StatusChip;
