# BullMQ Configuration Guide

Quick setup guide for the BullMQ queue system.

## Prerequisites

- Redis server running (local or remote)
- Node.js 18+
- All dependencies installed: `npm install`

## Step 1: Set Environment Variables

Create or update your `.env` file:

```env
# Redis Connection
REDIS_URL=redis://localhost:6379

# API Server
PORT=4000
NODE_ENV=development
```

### Redis Connection URL Formats

- **Local Redis:** `redis://localhost:6379`
- **Remote Redis:** `redis://user:password@host:port`
- **Redis Cloud:** `rediss://user:password@host:port` (note the `rediss` for TLS)

## Step 2: Start Redis

### Using Docker (Recommended)

```bash
docker run -d -p 6379:6379 redis:latest
```

### Using Homebrew (macOS)

```bash
brew install redis
brew services start redis
```

### Using APT (Ubuntu/Debian)

```bash
sudo apt-get install redis-server
sudo service redis-server start
```

## Step 3: Start the API Server

```bash
npm run dev
```

The server will automatically:
1. Connect to Redis
2. Initialize all queues (SCRIPT, IMAGE, VOICE, RENDER)
3. Create database connections

## Step 4: Start Workers (Optional)

If workers are not initialized with the server, start them separately:

```bash
# Create a new terminal
npm run dev:workers
```

Or add this script to `package.json`:

```json
{
  "scripts": {
    "dev:workers": "ts-node-dev --respawn --transpile-only src/workers/index.ts"
  }
}
```

## Verification

### Check Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Check Queue Status

```bash
# Start a TypeScript REPL
ts-node

# In the REPL:
import { getScriptQueue } from "./src/queues";
const queue = getScriptQueue();
const counts = await queue.getJobCounts();
console.log(counts);
```

### View Queue Jobs (Web UI)

Install and run BullMQ Board for a web dashboard:

```bash
npm install bull-board
```

Update [src/server.ts](src/server.ts):

```typescript
import { createBullBoard } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import {
  getScriptQueue,
  getImageQueue,
  getVoiceQueue,
  getRenderQueue,
} from "./queues";

// Add this after all queues are initialized
const { router } = createBullBoard({
  queues: [
    new BullAdapter(getScriptQueue()),
    new BullAdapter(getImageQueue()),
    new BullAdapter(getVoiceQueue()),
    new BullAdapter(getRenderQueue()),
  ],
});

app.use("/admin/queues", router);
```

Then visit: `http://localhost:4000/admin/queues`

## Troubleshooting

### "Redis connection error: connect ECONNREFUSED"

- Ensure Redis is running on the correct host/port
- Check `REDIS_URL` environment variable
- Try: `redis-cli ping`

### "Queue not initialized"

- Ensure server started successfully
- Check for errors in server logs
- Verify Redis is accessible

### Workers not processing jobs

- Check workers are running
- Verify Redis connection is active
- Check worker logs for errors
- Ensure workers can write to storage directories

### Memory Issues

- Clean old jobs: `npm run clean:queues`
- Reduce `maxRetriesPerRequest` in [src/lib/redis.ts](src/lib/redis.ts)
- Monitor Redis memory: `redis-cli info memory`

## Production Deployment

### Redis in Production

For production environments:

1. **Use a managed Redis service:**
   - AWS ElastiCache
   - Azure Cache for Redis
   - Redis Cloud (redislabs.com)

2. **Configure Redis securely:**
   ```env
   REDIS_URL=rediss://user:password@production-redis.example.com:6380
   ```

3. **Enable persistence:**
   - RDB snapshots
   - AOF (Append Only File)

### Worker Deployment

Consider running workers in separate containers/processes:

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start:workers"]
```

### Monitoring

- Use BullMQ Board for job monitoring
- Set up alerts for failed jobs
- Monitor Redis memory and CPU
- Track job processing times

## Key Features

✅ **Retry Logic:** 3 attempts with exponential backoff  
✅ **Auto-cleanup:** Successful jobs auto-removed  
✅ **Error Handling:** Failed jobs kept for debugging  
✅ **Type Safety:** Full TypeScript support  
✅ **Graceful Shutdown:** Proper cleanup on exit  
✅ **Connection Pooling:** Redis connection reused  

## Next Steps

1. Implement actual job processors in [src/workers/](src/workers/)
2. Create API endpoints for job monitoring
3. Integrate with existing services
4. Add queue monitoring dashboard
5. Set up production Redis
6. Deploy workers to production

## More Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [BullMQ Board](https://github.com/felixmosh/bull-board)
