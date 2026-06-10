#!/usr/bin/env ts-node
/**
 * Quick test script to verify BullMQ is processing jobs
 * Run with: npx ts-node test-queues.ts
 */

import { addVoiceJob } from "./src/queues/voice.queue";
import { addImageJob } from "./src/queues/image.queue";
import { getVoiceQueue, getImageQueue, initializeAllQueues } from "./src/queues";
import { getRedisClient } from "./src/lib/redis";
import { logger } from "./src/utils/logger";

async function testQueues() {
  try {
    // Initialize Redis
    getRedisClient();
    logger.info("Connected to Redis");

    // Initialize queues
    initializeAllQueues();
    logger.info("Queues initialized");

    // Test 1: Add a voice job
    logger.info("\n=== Test 1: Adding Voice Job ===");
    const voiceJob = await addVoiceJob({
      projectId: "test-proj",
      videoId: "test-video-1",
      sceneId: "scene-1",
      text: "Hello world, this is a test of the voice generation system.",
      voice: "en-US-lessac",
    });
    logger.info(`Voice job created: ${voiceJob.id}`);

    // Test 2: Add an image job
    logger.info("\n=== Test 2: Adding Image Job ===");
    const imageJob = await addImageJob({
      projectId: "test-proj",
      videoId: "test-video-1",
      sceneId: "scene-1",
      description: "A beautiful sunset over mountains",
    });
    logger.info(`Image job created: ${imageJob.id}`);

    // Test 3: Monitor job status
    logger.info("\n=== Test 3: Monitoring Jobs (waiting 3 seconds for processing) ===");
    const voiceQueue = getVoiceQueue();
    const imageQueue = getImageQueue();

    // Wait for jobs to process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const voiceState = await voiceJob.getState();
    logger.info(`Voice job state: ${voiceState}`);

    const imageState = await imageJob.getState();
    logger.info(`Image job state: ${imageState}`);

    // Test 4: Check queue stats
    logger.info("\n=== Test 4: Queue Statistics ===");
    const voiceCounts = await voiceQueue.getJobCounts();
    const imageCounts = await imageQueue.getJobCounts();

    logger.info(
      `Voice Queue: waiting=${voiceCounts.waiting}, active=${voiceCounts.active}, completed=${voiceCounts.completed}, failed=${voiceCounts.failed}`
    );
    logger.info(
      `Image Queue: waiting=${imageCounts.waiting}, active=${imageCounts.active}, completed=${imageCounts.completed}, failed=${imageCounts.failed}`
    );

    // Test 5: Get job results
    logger.info("\n=== Test 5: Job Results ===");
    const voiceResult = voiceJob.returnvalue;
    logger.info(`Voice job result: ${JSON.stringify(voiceResult)}`);

    const imageResult = imageJob.returnvalue;
    logger.info(`Image job result: ${JSON.stringify(imageResult)}`);

    logger.info("\n✅ All tests completed!");
    process.exit(0);
  } catch (error) {
    logger.error("Test failed:", { error: String(error) });
    process.exit(1);
  }
}

testQueues();
