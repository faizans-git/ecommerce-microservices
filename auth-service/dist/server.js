import "dotenv/config";
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import router from "./routes/auth.js";
import cors from "cors";
import helmet from "helmet";
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(errorHandler);
app.use("/api/auth", router);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    logger.info(`Auth service runnning at ${PORT}`);
    console.log("Listening");
});
//# sourceMappingURL=server.js.map