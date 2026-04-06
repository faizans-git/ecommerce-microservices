import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { AppError } from "./errorHandler.js";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  next();
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);

  const error = new AppError(
    `Can't find ${req.originalUrl} on this server`,
    404,
  );
  next(error);
};
