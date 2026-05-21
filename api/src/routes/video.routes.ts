import { Router } from "express";
import {
  handleCreateVideoJob,
  handleGetVideoJob,
  handleGetVideoJobs,
} from "../controllers/video.controller";

const router = Router();

router.post("/create", handleCreateVideoJob);
router.get("/", handleGetVideoJobs);
router.get("/:id", handleGetVideoJob);

export default router;
