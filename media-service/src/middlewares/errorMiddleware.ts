import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isProd = process.env.NODE_ENV === "production";

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  logger.error("Request failed", {
    message,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message:
      isProd && !err.isOperational ? "Internal server error occurred" : message,
  });
};

export { AppError };
