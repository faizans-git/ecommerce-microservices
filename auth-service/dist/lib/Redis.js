import { createClient } from "redis";
import logger from "../utils/logger.js";
export const redisClient = createClient({
    url: "redis://localhost:6379",
});
redisClient.on("error", (error) => logger.error(`Redis Client Error ${error}`));
await redisClient
    .connect()
    .then(() => logger.info("Redis connected"))
    .catch(() => logger.error("Redis connection failed"));
//# sourceMappingURL=Redis.js.map