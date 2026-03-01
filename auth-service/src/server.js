import express from "express";
import { config } from "dotenv";
import errorHandler from "./middlewares/errorHandler";
import logger from "./utils/logger";

config();

const app = express();

app.use(express.json());
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger(`Auth service runnning at ${PORT}`);
});
