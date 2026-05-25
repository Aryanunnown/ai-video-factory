import { Router } from "express";
import healthRouter from "./healthRoutes";
import videoRouter from "./video.routes";
import testImageRouter from "./testImageRoutes";

const router = Router();

router.use("/health", healthRouter);
router.use("/video", videoRouter);
router.use("/", testImageRouter);

export default router;
