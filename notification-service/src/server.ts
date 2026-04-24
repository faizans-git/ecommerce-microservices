import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./libs/logger.js";
import { connectRabbitMq, isChannelReady } from "./libs/rabbitmq.js";
import { startEmailConsumer } from "./consumers/task.consumer.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:4000" }));

app.get("/health", (_req, res) => {
  const ready = isChannelReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    service: "notification",
    rabbitmq: ready ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

async function start() {
  try {
    await connectRabbitMq();
    await startEmailConsumer();

    const PORT = process.env.PORT || 3005;
    const server = app.listen(PORT, () => {
      logger.info(`Notification service running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down`);
      server.close(() => {
        logger.info("Shutdown complete");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection", { reason });
    });
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception", { message: err.message });
      process.exit(1);
    });
  } catch (err: any) {
    logger.error("Failed to start notification service", {
      message: err.message,
    });
    process.exit(1);
  }
}

start();
