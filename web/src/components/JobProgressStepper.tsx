import {
  Stepper,
  Step,
  StepLabel,
  SvgIcon,
  CircularProgress,
} from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import type { JobProgress, ProgressStatus } from "../types/video";

const CheckCircleIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </SvgIcon>
);

const RadioButtonUncheckedIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </SvgIcon>
);

const ErrorIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </SvgIcon>
);

function StepIcon({ status }: { status: ProgressStatus }) {
  switch (status) {
    case "DONE":
      return <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />;
    case "PROCESSING":
      return <CircularProgress size={18} sx={{ color: "info.main" }} />;
    case "FAILED":
      return <ErrorIcon sx={{ color: "error.main", fontSize: 22 }} />;
    default:
      return <RadioButtonUncheckedIcon sx={{ color: "text.disabled", fontSize: 22 }} />;
  }
}

interface StepConfig {
  label: string;
  key: keyof JobProgress;
}

interface JobProgressStepperProps {
  progress: JobProgress;
  steps?: StepConfig[];
}

const defaultSteps: StepConfig[] = [
  { label: "Script", key: "script" },
  { label: "Image", key: "image" },
  { label: "Voice", key: "voice" },
  { label: "Render", key: "render" },
];

const JobProgressStepper = ({ progress, steps = defaultSteps }: JobProgressStepperProps) => {
  return (
    <Stepper
      nonLinear
      activeStep={-1}
      sx={{
        width: "100%",
        "& .MuiStepConnector-root": { minWidth: 0, flex: "0 0 16px" },
        "& .MuiStepLabel-label": { fontSize: "0.75rem", mt: 0.25 },
      }}
    >
      {steps.map((step) => (
        <Step key={step.key} completed={progress[step.key] === "DONE"}>
          <StepLabel icon={<StepIcon status={progress[step.key]} />}>
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default JobProgressStepper;
