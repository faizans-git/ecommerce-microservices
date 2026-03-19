import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

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

export const notFound = (req: Request, res: Response) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: "Not a valid url",
  });
};
