import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import logger from "./lib/logger.js";
import { requestLogger } from "./middlewares/requestLogger.js";

import orderRoutes from "./routes/order-routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  logger.info(`Order service running on port ${PORT}`);
});
