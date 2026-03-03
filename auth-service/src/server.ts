import express from "express";
import { config } from "dotenv";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

config();

const app = express();

app.use(express.json());
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Auth service runnning at ${PORT}`);
  console.log("Listening");
});
