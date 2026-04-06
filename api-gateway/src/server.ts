import "dotenv/config";
import express from "express";
import logger from "./utils/logger.js";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/proxyRoutes.js";
import { authLimiter, generalLimiter } from "./middlewares/rateLimiter.js";
import { notFound, requestLogger } from "./middlewares/utilMiddlewares.js";
import { connectRedis } from "./config/redisClient.js";
import shutdown from "./utils/shutDown.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);

app.use("/api", router);

app.use("*", notFound);

app.use(errorHandler);

await connectRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running at: ${PORT}`);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
