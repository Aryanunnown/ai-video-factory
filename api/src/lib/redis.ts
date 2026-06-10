import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisInstance: Redis | null = null;

/**
 * Get or create a Redis connection singleton
 * Uses REDIS_URL environment variable, defaults to localhost
 */
export function getRedisClient(): Redis {
  if (redisInstance) {
    return redisInstance;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  try {
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
    });

    redisInstance.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redisInstance.on("error", (error) => {
      logger.error("Redis connection error:", { error: String(error) });
    });

    redisInstance.on("close", () => {
      logger.info("Redis connection closed");
    });

    return redisInstance;
  } catch (error) {
    logger.error("Failed to initialize Redis client:", { error: String(error) });
    throw error;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}

/**
 * Get current Redis instance (throws if not connected)
 */
export function requireRedis(): Redis {
  if (!redisInstance) {
    throw new Error("Redis client not initialized. Call getRedisClient() first.");
  }
  return redisInstance;
}
