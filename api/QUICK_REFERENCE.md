# Quick Reference: BullMQ Setup

## Files Created

### Redis & Queue Core (5 files)
- `src/lib/redis.ts` - Redis connection singleton
- `src/queues/factory.ts` - Queue factory
- `src/queues/index.ts` - Export all queues

### Queue Definitions (5 files)
- `src/queues/script.queue.ts` - Script generation queue
- `src/queues/image.queue.ts` - Image generation queue
- `src/queues/voice.queue.ts` - Voice/audio generation queue
- `src/queues/render.queue.ts` - Video rendering queue
- `src/queues/EXAMPLES.ts` - Code examples and patterns

### Workers (5 files)
- `src/workers/script-processor.ts` - Script job processor
- `src/workers/image-processor.ts` - Image job processor
- `src/workers/voice-processor.ts` - Voice job processor
- `src/workers/queue-processors.ts` - Render job processor
- `src/workers/index.ts` - Worker exports and initialization

### Documentation (4 files)
- `BULLMQ_SETUP.md` - Complete API reference
- `CONFIG_GUIDE.md` - Setup & deployment guide
- `IMPLEMENTATION_SUMMARY.md` - What was created & next steps
- This file: Quick reference

### Modified Files
- `src/server.ts` - Added queue initialization & graceful shutdown

## Quick Setup

### 1. Environment
```bash
# .env
REDIS_URL=redis://localhost:6379
PORT=4000
```

### 2. Start Redis
```bash
docker run -d -p 6379:6379 redis:latest
```

### 3. Start Server
```bash
npm run dev
```

## Common Tasks

### Add Job to Script Queue
```typescript
import { addScriptJob } from "./src/queues";

const job = await addScriptJob({
  projectId: "proj-123",
  videoId: "video-456",
  prompt: "Generate a sunset video",
});
```

### Get Queue Status
```typescript
import { getScriptQueue } from "./src/queues";

const queue = getScriptQueue();
const counts = await queue.getJobCounts();
console.log(counts); // { waiting, active, completed, failed, ...}
```

### Process Jobs
Workers auto-process jobs. Update processor files with actual logic:
- `src/workers/script-processor.ts`
- `src/workers/image-processor.ts`
- `src/workers/voice-processor.ts`
- `src/workers/queue-processors.ts`

### Monitor Jobs (Web UI)
```bash
npm install @bull-board/express @bull-board/api
```
Then update `src/server.ts` to add Bull Board dashboard.

## Queue Names
- `SCRIPT_QUEUE` - Generate video scripts
- `IMAGE_QUEUE` - Generate scene images
- `VOICE_QUEUE` - Generate narration audio
- `RENDER_QUEUE` - Render final videos

## Key Features
✅ Automatic retry (3 attempts)  
✅ Exponential backoff on failure  
✅ Auto-cleanup of successful jobs  
✅ Failed job retention  
✅ Full TypeScript support  
✅ Graceful shutdown  
✅ Redis connection pooling  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Redis connection refused | Check Redis is running, verify `REDIS_URL` |
| Queue not initialized | Ensure server started successfully |
| Jobs not processing | Verify workers are running, check logs |
| TypeScript errors | All files checked, no errors ✅ |

## Next Steps
1. ✏️ Implement actual logic in worker processors
2. 🔗 Integrate with existing services
3. 🛣️ Create API endpoints for job management
4. 📊 Add queue monitoring dashboard
5. 🚀 Deploy workers to production

## File Locations
```
api/
├── src/
│   ├── lib/redis.ts
│   ├── queues/
│   │   ├── factory.ts
│   │   ├── script.queue.ts
│   │   ├── image.queue.ts
│   │   ├── voice.queue.ts
│   │   ├── render.queue.ts
│   │   ├── index.ts
│   │   └── EXAMPLES.ts
│   ├── workers/
│   │   ├── script-processor.ts
│   │   ├── image-processor.ts
│   │   ├── voice-processor.ts
│   │   ├── queue-processors.ts
│   │   └── index.ts
│   └── server.ts (UPDATED)
├── BULLMQ_SETUP.md
├── CONFIG_GUIDE.md
├── IMPLEMENTATION_SUMMARY.md
└── QUICK_REFERENCE.md (this file)
```

## Dependencies
Already in `package.json`:
- `bullmq@^5.76.10`
- `ioredis@^5.10.1`

## Need Help?
- **Setup Issues?** → Read `CONFIG_GUIDE.md`
- **API Reference?** → Read `BULLMQ_SETUP.md`
- **Code Examples?** → Check `src/queues/EXAMPLES.ts`
- **Full Context?** → Read `IMPLEMENTATION_SUMMARY.md`

---
**Status:** ✅ Ready to use  
**TypeScript Errors:** 0  
**Dependencies:** Already installed
