import { createClient } from "redis";
import logger from "../utils/logger.js";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("ready", () => {
  logger.info("Redis ready");
});

redis.on("error", (err: Error) => {
  logger.error("Redis error", {
    message: err.message,
    stack: err.stack,
  });
});

redis.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

export const connectRedis = async () => {
  if (redis.isOpen || redis.isReady) return;

  try {
    await redis.connect();
  } catch (err: unknown) {
    const error = err as Error;
    logger.error("Failed to connect to Redis", {
      message: error.message,
    });
  }
};

connectRedis();

const shutdown = async (signal: string) => {
  try {
    logger.info(`Redis shutting down due to ${signal}`);

    if (redis.isOpen) {
      await redis.quit();
      logger.info("Redis disconnected");
    }

    process.exit(0);
  } catch (err: unknown) {
    const error = err as Error;
    logger.error("Redis shutdown error", {
      message: error.message,
    });

    process.exit(1);
  }
};
// add em later
// process.on("SIGINT", () => shutdown("SIGINT"));
// process.on("SIGTERM", () => shutdown("SIGTERM"));

export default redis;
