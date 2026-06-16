import { Queue } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { logger } from "../utils/logger";

const queueCache = new Map<string, Queue>();

/**
 * Create or retrieve a BullMQ queue with standardized configuration
 */
export function createQueue<T = any>(queueName: string): Queue<T> {
  if (queueCache.has(queueName)) {
    return queueCache.get(queueName)! as Queue<T>;
  }

  try {
    const redisClient = getRedisClient();

    const queue = new Queue<T>(queueName, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    queue.on("waiting", (job) => {
      logger.info(`Queue '${queueName}' job waiting: ${job.id}`, {
        queue: queueName,
        jobName: job.name,
        data: job.data,
      });
    });

    queue.on("error", (error) => {
      logger.error(`Queue ${queueName} error:`, { error: String(error) });
    });

    queueCache.set(queueName, queue);
    logger.info(`Queue '${queueName}' created successfully`);

    return queue;
  } catch (error) {
    logger.error(`Failed to create queue '${queueName}':`, { error: String(error) });
    throw error;
  }
}

/**
 * Get all cached queue instances
 */
export function getAllQueues(): Queue[] {
  return Array.from(queueCache.values());
}

/**
 * Close all queues
 */
export async function closeAllQueues(): Promise<void> {
  const queues = getAllQueues();

  try {
    await Promise.all(queues.map((queue) => queue.close()));
    queueCache.clear();
    logger.info("All queues closed successfully");
  } catch (error) {
    logger.error("Error closing queues:", { error: String(error) });
    throw error;
  }
}

/**
 * Purge all jobs from a queue
 */
export async function purgeQueue(queueName: string): Promise<void> {
  const queue = queueCache.get(queueName);
  if (queue) {
    await queue.obliterate({ force: true });
    logger.info(`Queue '${queueName}' purged`);
  }
}
