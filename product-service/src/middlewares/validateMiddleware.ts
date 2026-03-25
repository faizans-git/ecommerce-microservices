import { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import logger from "../lib/logger.js";
import { AppError } from "./errorMiddleware.js";

export const validate = (
  schema: ObjectSchema,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((e) => e.message);

      logger.warn("Validation failed", {
        source,
        path: req.originalUrl,
        method: req.method,
        errors,
      });

      return next(new AppError("Validation error", 400, true));
    }

    req[source] = value;
    next();
  };
};
