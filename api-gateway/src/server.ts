import "dotenv/config";
import express from "express";
import logger from "./utils/logger.js";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/proxyRoutes.js";
import { notFound, requestLogger } from "./middlewares/utilMiddlewares.js";
import shutdown from "./utils/shutDown.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  }),
);
app.use(requestLogger);

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running at: ${PORT}`);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
