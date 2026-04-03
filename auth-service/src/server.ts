import "dotenv/config";
import express from "express";
import logger from "./utils/logger.js";
import router from "./routes/auth-routes.js";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(helmet());
// will change it befire deplowment not now
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/auth", router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Auth service running at ${PORT}`);
});
