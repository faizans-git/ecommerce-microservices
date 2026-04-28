import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (process.env.NODE_ENV !== "production") {
      logger.info("HTTP Request", {
        ...logData,
        query: req.query,
        params: req.params,
      });
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  next();
};
