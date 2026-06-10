# BullMQ Queue Infrastructure

Complete guide for using the BullMQ queue system in the AI Video Factory API.

## Overview

The application now uses **BullMQ** with **Redis** for job queue management. Four main queues handle the video generation pipeline:

1. **SCRIPT_QUEUE** - Generates video scripts from prompts
2. **IMAGE_QUEUE** - Generates images for scenes
3. **VOICE_QUEUE** - Generates voice/audio for narration
4. **RENDER_QUEUE** - Renders final video

## Architecture

### Directory Structure

```
src/
├── lib/
│   └── redis.ts              # Redis connection singleton
├── queues/
│   ├── factory.ts            # Queue factory and utilities
│   ├── script.queue.ts       # Script queue definition
│   ├── image.queue.ts        # Image queue definition
│   ├── voice.queue.ts        # Voice queue definition
│   ├── render.queue.ts       # Render queue definition
│   └── index.ts              # Main exports
└── workers/
    ├── script-processor.ts   # Script job processor
    ├── image-processor.ts    # Image job processor
    ├── voice-processor.ts    # Voice job processor
    ├── queue-processors.ts   # Render job processor
    └── index.ts              # Worker exports
```

## Configuration

### Environment Variables

```env
# Redis connection URL (required)
REDIS_URL=redis://localhost:6379

# Optional: Custom Redis connection settings can be added to src/lib/redis.ts
```

## Usage

### Initialize Queues

The queues are automatically initialized on server startup in [src/server.ts](src/server.ts).

```typescript
import { getRedisClient } from "./lib/redis";
import { initializeAllQueues } from "./queues";

// Initialize Redis connection
getRedisClient();

// Initialize all queues
initializeAllQueues();
```

### Add Jobs to Queues

#### Add Script Job

```typescript
import { addScriptJob, type ScriptJobData } from "./queues";

const scriptJob: ScriptJobData = {
  projectId: "proj-123",
  videoId: "video-456",
  prompt: "A beautiful sunset over the ocean",
};

const job = await addScriptJob(scriptJob);
console.log(`Job added with ID: ${job.id}`);
```

#### Add Image Job

```typescript
import { addImageJob, type ImageJobData } from "./queues";

const imageJob: ImageJobData = {
  projectId: "proj-123",
  videoId: "video-456",
  sceneId: "scene-1",
  description: "A red sunset over mountains",
};

const job = await addImageJob(imageJob);
```

#### Add Voice Job

```typescript
import { addVoiceJob, type VoiceJobData } from "./queues";

const voiceJob: VoiceJobData = {
  projectId: "proj-123",
  videoId: "video-456",
  sceneId: "scene-1",
  text: "Welcome to this amazing video",
  voice: "en-US-male",
};

const job = await addVoiceJob(voiceJob);
```

#### Add Render Job

```typescript
import { addRenderJob, type RenderJobData } from "./queues";

const renderJob: RenderJobData = {
  projectId: "proj-123",
  videoId: "video-456",
  scenes: [
    {
      sceneId: "scene-1",
      imageUrl: "/storage/images/scene-1.jpg",
      audioUrl: "/storage/audio/scene-1.mp3",
      duration: 5,
    },
  ],
};

const job = await addRenderJob(renderJob);
```

### Processing Jobs

Workers automatically process jobs from their respective queues. To initialize all workers:

```typescript
import { initializeAllWorkers } from "./workers";

const workers = initializeAllWorkers();
console.log(`${workers.length} workers initialized`);
```

### Monitor Queue Status

```typescript
import { getScriptQueue, getImageQueue, getVoiceQueue, getRenderQueue } from "./queues";

const scriptQueue = getScriptQueue();

// Get queue counts
const counts = await scriptQueue.getJobCounts();
console.log(`Waiting: ${counts.waiting}, Active: ${counts.active}, Completed: ${counts.completed}`);

// Get job by ID
const job = await scriptQueue.getJob("script-video-456-123456");
console.log(`Job status: ${job?.getState()}`);

// Listen for job completion
scriptQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
```

## Type Definitions

### ScriptJobData

```typescript
interface ScriptJobData {
  projectId: string;
  videoId: string;
  prompt: string;
  [key: string]: any;
}

interface ScriptJobResult {
  status: "success" | "failed";
  data?: any;
  error?: string;
}
```

### ImageJobData

```typescript
interface ImageJobData {
  projectId: string;
  videoId: string;
  sceneId: string;
  description: string;
  [key: string]: any;
}

interface ImageJobResult {
  status: "success" | "failed";
  imagePath?: string;
  error?: string;
}
```

### VoiceJobData

```typescript
interface VoiceJobData {
  projectId: string;
  videoId: string;
  sceneId: string;
  text: string;
  voice?: string;
  [key: string]: any;
}

interface VoiceJobResult {
  status: "success" | "failed";
  audioPath?: string;
  duration?: number;
  error?: string;
}
```

### RenderJobData

```typescript
interface RenderJobData {
  projectId: string;
  videoId: string;
  scenes: Array<{
    sceneId: string;
    imageUrl?: string;
    audioUrl?: string;
    duration?: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface RenderJobResult {
  status: "success" | "failed";
  videoPath?: string;
  duration?: number;
  error?: string;
}
```

## Queue Factory API

### `createQueue<T>(queueName: string): Queue<T>`

Create or retrieve a BullMQ queue with standardized configuration.

```typescript
import { createQueue } from "./queues/factory";

const customQueue = createQueue("CUSTOM_QUEUE");
```

### `getAllQueues(): Queue[]`

Get all active queue instances.

```typescript
import { getAllQueues } from "./queues/factory";

const allQueues = getAllQueues();
allQueues.forEach(queue => console.log(queue.name));
```

### `closeAllQueues(): Promise<void>`

Close all queues and cleanup resources.

```typescript
import { closeAllQueues } from "./queues/factory";

await closeAllQueues();
```

### `purgeQueue(queueName: string): Promise<void>`

Remove all jobs from a queue.

```typescript
import { purgeQueue } from "./queues/factory";

await purgeQueue("SCRIPT_QUEUE");
```

## Redis Connection API

### `getRedisClient(): Redis`

Get or create the Redis connection singleton.

```typescript
import { getRedisClient } from "./lib/redis";

const redis = getRedisClient();
```

### `closeRedisConnection(): Promise<void>`

Close the Redis connection.

```typescript
import { closeRedisConnection } from "./lib/redis";

await closeRedisConnection();
```

### `requireRedis(): Redis`

Get the Redis client or throw an error if not initialized.

```typescript
import { requireRedis } from "./lib/redis";

try {
  const redis = requireRedis();
} catch (error) {
  console.error("Redis not initialized");
}
```

## Job Options

All jobs are created with default retry logic:

- **Max Retries:** 3 attempts
- **Backoff Strategy:** Exponential (2000ms initial delay)
- **Auto-complete Removal:** Successful jobs are automatically removed
- **Failed Job Retention:** Failed jobs are kept for debugging

To customize job options, modify the `defaultJobOptions` in [src/queues/factory.ts](src/queues/factory.ts).

## Graceful Shutdown

The server automatically closes all queues and Redis connection on shutdown signals (SIGINT, SIGTERM).

```typescript
// In src/server.ts
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
```

## Troubleshooting

### Queue Not Initialized

**Error:** "Queue not initialized. Call initializeScriptQueue() first."

**Solution:** Ensure queues are initialized before use. This happens automatically on server startup.

### Redis Connection Failed

**Error:** "Error: connect ECONNREFUSED"

**Solution:** 
1. Ensure Redis is running locally or accessible via `REDIS_URL`
2. Check Redis connection settings in [src/lib/redis.ts](src/lib/redis.ts)

### Jobs Not Processing

**Error:** Jobs stuck in "waiting" state

**Solution:**
1. Ensure worker processes are running with `initializeAllWorkers()`
2. Check worker logs for errors
3. Verify Redis connection is active

## Best Practices

1. **Use TypeScript Types:** Always use the provided job data types for type safety
2. **Handle Errors:** Implement proper error handling in worker processors
3. **Monitor Queues:** Regularly check queue stats in production
4. **Set Job IDs:** Use meaningful job IDs for easier tracking
5. **Cleanup:** Regularly purge completed jobs to save memory
6. **Logging:** Use the logger utility for consistent logging

## Next Steps

1. Update worker processors in [src/workers/](src/workers/) with actual implementation logic
2. Integrate with existing services (script, visual, voice, render)
3. Add queue monitoring dashboard
4. Implement job retry and error handling strategies
5. Add comprehensive logging and metrics
