import { Router } from "express";
import healthRouter from "./healthRoutes";
import videoRouter from "./video.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/video", videoRouter);

export default router;
