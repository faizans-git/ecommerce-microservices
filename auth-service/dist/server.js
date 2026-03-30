import "dotenv/config";
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import router from "./routes/auth.js";
import cors from "cors";
import helmet from "helmet";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(apiRateLimiter);
app.use("/api/auth", router);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    logger.info(`Auth service runnning at ${PORT}`);
    console.log("Listening");
});
//# sourceMappingURL=server.js.map