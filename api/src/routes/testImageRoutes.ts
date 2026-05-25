import { Router } from "express";
import { generateImage } from "../services/flux.service";

const router = Router();

router.get("/test-image", async (req, res) => {
  const { prompt } = req.query;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      success: false,
      error: "Prompt query parameter is required and must be a string",
    });
  }

  try {
    const imagePath = await generateImage(prompt, "test");
    res.json({
      success: true,
      path: imagePath,
    });
  } catch (error) {
    console.error("Error generating test image:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;