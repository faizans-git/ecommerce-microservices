import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger.js";
import router from "./routes/auth-routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectRabbitMq } from "./lib/connectRabbitMq.js";
import prisma from "./lib/prisma.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:4000",
    credentials: true,
  }),
);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "auth",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: "degraded", service: "auth" });
  }
});

app.use("/api/auth", router);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

async function start() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    await connectRabbitMq();

    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info("Shutdown complete");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection", { reason });
    });
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception", {
        message: err.message,
        stack: err.stack,
      });
      process.exit(1);
    });
  } catch (err: any) {
    logger.error("Failed to start auth service", { message: err.message });
    process.exit(1);
  }
}

start();
