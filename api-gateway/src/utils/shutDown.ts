import redisClient from "../config/redisClient.js"; // Import your client
import logger from "./logger.js";

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down API Gateway...`);

  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info("Redis connection closed.");
    }

    logger.info("Gateway shutdown complete.");
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown", { err });
    process.exit(1);
  }
};

export default shutdown;
