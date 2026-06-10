import "dotenv/config";
import app from "./app";
import { getRedisClient, closeRedisConnection } from "./lib/redis";
import { initializeAllQueues, closeAllQueues } from "./queues";
import { initializeAllWorkers } from "./workers";
import { logger } from "./utils/logger";

const port = Number(process.env.PORT ?? 4000);
let workers: any[] = [];

async function startServer() {
  try {
    // Initialize Redis connection
    getRedisClient();
    logger.info("Redis connection established");

    // Initialize all BullMQ queues
    initializeAllQueues();
    logger.info("All queues initialized");

    // Initialize all BullMQ workers
    workers = initializeAllWorkers();
    logger.info(`${workers.length} workers initialized`);

    const server = app.listen(port, () => {
      logger.info(`API server is running on http://localhost:${port}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      try {
        server.close(async (err) => {
          if (err) {
            logger.error("Error during server shutdown:", { error: String(err) });
            process.exit(1);
          }

          try {
            // Close all workers
            await Promise.all(workers.map((w) => w.close()));
            logger.info("All workers closed");

            // Close all queues
            await closeAllQueues();
            logger.info("All queues closed");

            // Close Redis connection
            await closeRedisConnection();
            logger.info("Redis connection closed");

            logger.info("Server shutdown complete.");
            process.exit(0);
          } catch (error) {
            logger.error("Error during cleanup:", { error: String(error) });
            process.exit(1);
          }
        });
      } catch (error) {
        logger.error("Error closing server:", { error: String(error) });
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection:", { reason: String(reason) });
      shutdown("unhandledRejection");
    });
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", { error: String(error) });
      shutdown("uncaughtException");
    });
  } catch (error) {
    logger.error("Failed to start server:", { error: String(error) });
    process.exit(1);
  }
}

// Start the server
startServer();
