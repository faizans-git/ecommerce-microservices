import { Redis } from "ioredis";
import logger from "../utils/logger.js";

const redisClient: Redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),

  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,

  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis error", {
    message: err.message,
    stack: err.stack,
  });
});

process.on("SIGINT", async () => {
  await redisClient.quit();
  logger.info("Redis connection closed");
  process.exit(0);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Reddis connected");
  } catch (err) {
    logger.error("Redis connection failed", { err });
  }
};

export default redisClient;
