import logger from "../utils/logger.js";
import type { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(error);
  const isProd = process.env.NODE_ENV === "production";
  res.status(error.status || 500).json({
    message: !isProd ? error.message : "Internal server error occurred",
  });
};

export default errorHandler;
